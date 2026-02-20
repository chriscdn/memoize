"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Memoize: () => Memoize,
  MemoizeAsync: () => MemoizeAsync
});
module.exports = __toCommonJS(index_exports);
var import_promise_semaphore = require("@chriscdn/promise-semaphore");
var import_quick_lru = __toESM(require("quick-lru"), 1);
var kDefaultMaxSize = 1e3;
var Memoize = (cb, options = {}) => {
  const maxAge = options.maxAge;
  const maxSize = options.maxSize ?? kDefaultMaxSize;
  const shouldCache = options.shouldCache ?? (() => true);
  const resolver = options.resolver ?? ((...args) => JSON.stringify(args));
  const cache = new import_quick_lru.default({
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
  const cache = new import_quick_lru.default({
    maxAge,
    maxSize
  });
  const semaphore = new import_promise_semaphore.Semaphore();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Memoize,
  MemoizeAsync
});
//# sourceMappingURL=index.cjs.map