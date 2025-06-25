import { Semaphore } from "@chriscdn/promise-semaphore";
import QuickLRU from "quick-lru";

const kDefaultMaxSize = 1000;

type Options<T extends any[], Return> = {
  maxSize: number;
  maxAge?: number;
  shouldCache: (returnValue: Return, key: string) => boolean;
  resolver: (...args: T) => string;
};

/**
 * Memoize a synchronous function.
 */
const Memoize = <Args extends unknown[], Return>(
  cb: (...args: Args) => Return,
  options: Partial<Options<Args, Return>> = {},
) => {
  const maxAge: number | undefined = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);

  const resolver = options.resolver ??
    ((...args: Args) => JSON.stringify(args));

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
        cache.set(key, returnValue);
      }
      return returnValue;
    }
  };

  memoizedFunction.cache = cache;

  return memoizedFunction;
};

/**
 * Memoize an asynchronous function.
 */
const MemoizeAsync = <Args extends unknown[], Return>(
  cb: (...args: Args) => Promise<Return>,
  options: Partial<Options<Args, Return>> = {},
) => {
  const maxAge: number | undefined = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);

  const resolver = options.resolver ??
    ((...args: Args) => JSON.stringify(args));

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
          cache.set(key, returnValue);
        }
        return returnValue;
      }
    } finally {
      semaphore.release(key);
    }
  };

  memoizedFunction.cache = cache;

  return memoizedFunction;
};

export { Memoize, MemoizeAsync };
