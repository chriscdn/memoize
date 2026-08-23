import { Semaphore } from "@chriscdn/promise-semaphore";
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

const kDefaultMaxSize = 1000;

type Options<T extends unknown[], Return> = {
  maxSize: number;
  maxAge?: number;
  shouldCache: (returnValue: Return, key: string) => boolean;
  ttl?: (value: Return, key: string) => number;
  resolver: (...args: T) => string;
};

/**
 * Memoize a synchronous function.
 */
const Memoize = <Args extends unknown[], Return>(
  cb: (...args: Args) => Return,
  options: Partial<Options<Args, Return>> = {},
) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);
  const ttl = options.ttl ?? (() => undefined);

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

      if (shouldCache(returnValue, key)) {
        cache.set(key, returnValue, {
          maxAge: ttl(returnValue, key),
        });
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
  options: Partial<Options<Args, Return>> = {},
) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);
  const ttl = options.ttl ?? (() => maxAge);

  const resolver =
    options.resolver ?? ((...args: Args) => JSON.stringify(args));

  const cache = new QuickLRU<string, Return>({
    maxAge,
    maxSize,
  });

  const semaphore = new Semaphore();

  const memoizedFunction = async (...args: Args): Promise<Return> => {
    const key = resolver(...args);

    try {
      await semaphore.acquire(key);

      if (cache.has(key)) {
        return cache.get(key) as Return;
      } else {
        const returnValue = await cb(...args);
        if (shouldCache(returnValue, key)) {
          cache.set(key, returnValue, {
            maxAge: ttl(returnValue, key),
          });
        }
        return returnValue;
      }
    } finally {
      semaphore.release(key);
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
