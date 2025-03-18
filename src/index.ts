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

  const resolver =
    options.resolver ?? ((...args: Args) => JSON.stringify(args));

  const cache = new QuickLRU<string, Return>({
    maxAge,
    maxSize,
  });

  const memoizedFunction = (...args: Args): Return => {
    const key = resolver(...args);

    if (cache.has(key)) {
      return cache.get(key);
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
 * @deprecated `Memoize` can be used  for asynchronous functions.
 */
const MemoizeAsync = Memoize;

export { Memoize, MemoizeAsync };
