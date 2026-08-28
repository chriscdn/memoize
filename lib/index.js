import { isDefined, isDefinedOrNull, isNullish, isNumber, isUndefined } from "@chriscdn/type-guards";
import QuickLRU from "quick-lru";
//#region src/index.ts
const DEFAULT_CACHE_MAX_SIZE = 1e3;
/**
* Memoize a synchronous function.
*/
const Memoize = (cb, options = {}) => {
	const maxAge = options.maxAge;
	const maxSize = options.maxSize ?? DEFAULT_CACHE_MAX_SIZE;
	const shouldCache = options.shouldCache ?? (() => true);
	const ttl = options.ttl ?? (() => null);
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
			const ttlResults = ttl(returnValue, key);
			if (isUndefined(returnValue)) {} else if (!shouldCache(returnValue, key)) {} else if (isNumber(ttlResults) && ttlResults > 0) cache.set(key, returnValue, { maxAge: ttlResults });
			else if (isNullish(ttlResults)) cache.set(key, returnValue);
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
	const maxSize = options.maxSize ?? DEFAULT_CACHE_MAX_SIZE;
	const shouldCache = options.shouldCache ?? (() => true);
	const refreshWhen = options.refreshWhen ?? (() => false);
	const ttl = options.ttl ?? (() => null);
	const resolver = options.resolver ?? ((...args) => JSON.stringify(args));
	const cache = new QuickLRU({
		maxAge,
		maxSize
	});
	const inFlight = /* @__PURE__ */ new Map();
	const fetchAndCache = (key, args) => {
		const existing = inFlight.get(key);
		if (isDefined(existing)) return existing;
		else {
			const promise = (async () => {
				const value = await cb(...args);
				if (isUndefined(value)) return value;
				else {
					const ttlResults = ttl(value, key);
					if (!shouldCache(value, key)) {} else if (isNumber(ttlResults) && ttlResults > 0) cache.set(key, value, { maxAge: ttlResults });
					else if (isNullish(ttlResults)) cache.set(key, value);
					return value;
				}
			})();
			inFlight.set(key, promise);
			promise.finally(() => inFlight.delete(key)).catch(() => null);
			return promise;
		}
	};
	const memoizedFunction = async (...args) => {
		const key = resolver(...args);
		const cachedValue = cache.get(key);
		const cachedTTL = cache.expiresIn(key);
		if (isDefinedOrNull(cachedValue)) {
			if (isNumber(cachedTTL) && refreshWhen(cachedTTL, args, cachedValue)) fetchAndCache(key, args).catch(() => null);
			return cachedValue;
		} else return await fetchAndCache(key, args);
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