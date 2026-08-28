import {
  isDefined,
  isDefinedOrNull,
  isNullish,
  isNumber,
  isUndefined,
} from "@chriscdn/type-guards";

import QuickLRU from "quick-lru";

type CacheLike<K, V> = Pick<
  QuickLRU<K, V>,
  | "clear"
  | "delete"
  | "evict"
  | "expiresIn"
  | "get"
  | "has"
  | "maxAge"
  | "maxSize"
  | "peek"
  | "resize"
  | "size"
>;

const DEFAULT_CACHE_MAX_SIZE = 1000;

// type Options<T extends unknown[], Return> = {
//   maxSize: number;
//   maxAge?: number;
//   shouldCache: (returnValue: Return, key: string) => boolean;
//   refreshWhen?: (ttl: number, [...args]: T, value: Return) => boolean;
//   ttl?: (value: Return, key: string) => number | null | undefined;
//   resolver: (...args: T) => string;
// };

type Options<Args extends unknown[], Return> = {
  maxSize: number;
  maxAge?: number;
  shouldCache: (returnValue: Return, key: string) => boolean;
  ttl?: (value: Return, key: string) => number | null | undefined;
  resolver: (...args: Args) => string;
};

type OptionsAsync<Args extends unknown[], Return> = Options<Args, Return> & {
  refreshWhen?: (ttl: number, args: Args, value: Return) => boolean;
};

/**
 * Memoize a synchronous function.
 */
const Memoize = <Args extends unknown[], Return>(
  cb: (...args: Args) => Return,
  options: Partial<Options<Args, Return>> = {},
) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? DEFAULT_CACHE_MAX_SIZE;
  const shouldCache = options.shouldCache ?? (() => true);
  const ttl = options.ttl ?? (() => null);

  const resolver =
    options.resolver ?? ((...args: Args) => JSON.stringify(args));

  const cache = new QuickLRU<string, Return>({
    maxAge,
    maxSize,
  });

  const memoizedFunction = (...args: Args): Return => {
    const key = resolver(...args);

    if (cache.has(key)) {
      return cache.get(key) as Return;
    } else {
      const returnValue = cb(...args);
      const ttlResults = ttl(returnValue, key);

      if (isUndefined(returnValue)) {
        // do nothing
      } else if (!shouldCache(returnValue, key)) {
        // do nothing
      } else if (isNumber(ttlResults) && ttlResults > 0) {
        cache.set(key, returnValue, { maxAge: ttlResults });
      } else if (isNullish(ttlResults)) {
        cache.set(key, returnValue);
      }

      return returnValue;
    }
  };

  memoizedFunction.cache = cache as CacheLike<string, Return>;

  memoizedFunction.clear = () => cache.clear();
  memoizedFunction.delete = (...args: Args) => cache.delete(resolver(...args));
  memoizedFunction.expiresIn = (...args: Args) =>
    cache.expiresIn(resolver(...args));
  memoizedFunction.has = (...args: Args) => cache.has(resolver(...args));
  memoizedFunction.set = (
    args: Args,
    value: Return,
    options?: { maxAge: number },
  ) => {
    cache.set(resolver(...args), value, options);
  };

  return memoizedFunction;
};

/**
 * Memoize an asynchronous function.
 */
const MemoizeAsync = <Args extends unknown[], Return>(
  cb: (...args: Args) => Promise<Return>,
  options: Partial<OptionsAsync<Args, Return>> = {},
) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? DEFAULT_CACHE_MAX_SIZE;
  const shouldCache = options.shouldCache ?? (() => true);
  const refreshWhen = options.refreshWhen ?? (() => false);
  const ttl = options.ttl ?? (() => null);
  const resolver =
    options.resolver ?? ((...args: Args) => JSON.stringify(args));

  const cache = new QuickLRU<string, Return>({
    maxAge,
    maxSize,
  });

  const inFlight = new Map<string, Promise<Return>>();

  const fetchAndCache = (key: string, args: Args): Promise<Return> => {
    const existing = inFlight.get(key);

    if (isDefined(existing)) {
      return existing;
    } else {
      const promise = (async () => {
        const value = await cb(...args);

        if (isUndefined(value)) {
          return value;
        } else {
          const ttlResults = ttl(value, key);

          if (!shouldCache(value, key)) {
            // do nothing
          } else if (isNumber(ttlResults) && ttlResults > 0) {
            cache.set(key, value, { maxAge: ttlResults });
          } else if (isNullish(ttlResults)) {
            cache.set(key, value);
          }

          return value;
        }
      })();

      inFlight.set(key, promise);

      // The .catch() prevents an unhandled rejection from the promise created
      // by .finally(). The original promise still propagates its rejection.
      promise.finally(() => inFlight.delete(key)).catch(() => null);

      return promise;
    }
  };

  const memoizedFunction = async (...args: Args): Promise<Return> => {
    const key = resolver(...args);

    const cachedValue = cache.get(key);
    const cachedTTL = cache.expiresIn(key);

    const hasCachedValue = isDefinedOrNull(cachedValue);

    // let value: Return | undefined = isDefinedOrNull(_value) ? _value : undefined;

    if (hasCachedValue) {
      // Background refresh
      if (isNumber(cachedTTL) && refreshWhen(cachedTTL, args, cachedValue)) {
        fetchAndCache(key, args).catch(() => null);
      }

      return cachedValue;
    } else {
      return await fetchAndCache(key, args);
    }
  };

  memoizedFunction.cache = cache as CacheLike<string, Return>;

  memoizedFunction.clear = () => cache.clear();
  memoizedFunction.delete = (...args: Args) => cache.delete(resolver(...args));
  memoizedFunction.expiresIn = (...args: Args) =>
    cache.expiresIn(resolver(...args));
  memoizedFunction.has = (...args: Args) => cache.has(resolver(...args));
  memoizedFunction.set = (
    args: Args,
    value: Return,
    options?: { maxAge: number },
  ) => {
    cache.set(resolver(...args), value, options);
  };

  return memoizedFunction;
};

export { Memoize, MemoizeAsync };
