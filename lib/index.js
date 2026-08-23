import { Semaphore } from "@chriscdn/promise-semaphore";
import QuickLRU from "quick-lru";
//#region src/index.ts
const kDefaultMaxSize = 1e3;
/**
* Memoize a synchronous function.
*/
const Memoize = (cb, options = {}) => {
	const maxAge = options.maxAge;
	const maxSize = options.maxSize ?? kDefaultMaxSize;
	const shouldCache = options.shouldCache ?? (() => true);
	const ttl = options.ttl ?? (() => void 0);
	const resolver = options.resolver ?? ((...args) => JSON.stringify(args));
	const cache = new QuickLRU({
		maxAge,
		maxSize
	});
	const memoizedFunction = (...args) => {
		const key = resolver(...args);
		if (cache.has(key)) return cache.get(key);
		else {
			const returnValue = cb(...args);
			if (shouldCache(returnValue, key)) cache.set(key, returnValue, { maxAge: ttl(returnValue, key) });
			return returnValue;
		}
	};
	memoizedFunction.cache = cache;
	memoizedFunction.clear = () => cache.clear();
	memoizedFunction.delete = (...args) => cache.delete(resolver(...args));
	memoizedFunction.expiresIn = (...args) => cache.expiresIn(resolver(...args));
	memoizedFunction.has = (...args) => cache.has(resolver(...args));
	memoizedFunction.set = (args, value, options) => {
		cache.set(resolver(...args), value, options);
	};
	return memoizedFunction;
};
/**
* Memoize an asynchronous function.
*/
const MemoizeAsync = (cb, options = {}) => {
	const maxAge = options.maxAge;
	const maxSize = options.maxSize ?? kDefaultMaxSize;
	const shouldCache = options.shouldCache ?? (() => true);
	const ttl = options.ttl ?? (() => maxAge);
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
			if (cache.has(key)) return cache.get(key);
			else {
				const returnValue = await cb(...args);
				if (shouldCache(returnValue, key)) cache.set(key, returnValue, { maxAge: ttl(returnValue, key) });
				return returnValue;
			}
		} finally {
			semaphore.release(key);
		}
	};
	memoizedFunction.cache = cache;
	memoizedFunction.clear = () => cache.clear();
	memoizedFunction.delete = (...args) => cache.delete(resolver(...args));
	memoizedFunction.expiresIn = (...args) => cache.expiresIn(resolver(...args));
	memoizedFunction.has = (...args) => cache.has(resolver(...args));
	memoizedFunction.set = (args, value, options) => {
		cache.set(resolver(...args), value, options);
	};
	return memoizedFunction;
};
//#endregion
export { Memoize, MemoizeAsync };

//# sourceMappingURL=index.js.map