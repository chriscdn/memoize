// src/index.ts
import { Semaphore } from "@chriscdn/promise-semaphore";
import QuickLRU from "quick-lru";
var kDefaultMaxSize = 1e3;
var Memoize = (cb, options = {}) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);
  const resolver = options.resolver ?? ((...args) => JSON.stringify(args));
  const cache = new QuickLRU({
    maxAge,
    maxSize
  });
  const memoizedFunction = (...args) => {
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
var MemoizeAsync = (cb, options = {}) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);
  const resolver = options.resolver ?? ((...args) => JSON.stringify(args));
  const cache = new QuickLRU({
    maxAge,
    maxSize
  });
  const semaphore = new Semaphore();
  const memoizedFunction = async (...args) => {
    const key = resolver(...args);
    try {
      await semaphore.acquire(key);
      if (cache.has(key)) {
        return cache.get(key);
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
export {
  Memoize,
  MemoizeAsync
};
//# sourceMappingURL=index.js.map