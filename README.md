# @chriscdn/memoize

Memoize a synchronous or asynchronous function.

## Installing

Using npm:

```bash
npm install @chriscdn/memoize
```

Using yarn:

```bash
yarn add @chriscdn/memoize
```

## Usage

The package comes with two functions: `Memoize` and `MemoizeAsync`.

```ts
import { Memoize, MemoizeAsync } from "@chriscdn/memoize";
```

The `Memoize` function can be used to memoize a _synchronous_ function. The `MemoizeAsync` function can be used to memoize an _asynchronous_ function. The cache is based [quick-lru](https://www.npmjs.com/package/quick-lru).

Each call to `Memoize` or `MemoizeAsync` will create a new cache instance.

The `MemoizeAsync` function prevents duplicate evaluations by ensuring multiple calls with an identical cache key is only processed once.

By default, the cache key is generated by calling `JSON.stringify()` on the function arguments. This can be customized (see below).

**Example (synchronous)**

To memoize a function:

```ts
const _add = (x: number, y: number) => x + y;

const add = Memoize(_add);
```

The `add` function has the same interface as `_add`:

```ts
const result = add(5, 7);
// 12
```

**Example (asynchronous)**

The asynchronous case is similar:

```ts
const _add = async (x: number, y: number) => x + y;

const add = MemoizeAsync(_add);

const result = await add(5, 7);
// 12
```

## Options

The `Memoize` and `MemoizeAsync` functions accept an `Options` parameter to control the behaviour of the cache.

```ts
const add = MemoizeAsync(_add, options);
```

The available options are as follows, with their defaults:

```ts
const options = {
  // maximum number of items in the cache
  maxSize: 1000,

  // maximum number of milliseconds an item is to remain in the cache, undefined implies forever
  maxAge: undefined,

  // a synchronous function for generating a cache key (must return a String)
  resolver: (...args) => JSON.stringify(args),
};
```

## Cache

The underlying [quick-lru](https://www.npmjs.com/package/quick-lru) instance can be accessed with the `.cache` property on the memoized function.

```ts
const add = MemoizeAsync(_add);
const result = await add(5, 7);

console.log(addCachedAsync.cache.size === 1);
// true
```

## Tests

```bash
yarn test
```

## License

[MIT](LICENSE)
