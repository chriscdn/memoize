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

The `Memoize` function can be used to memoize a _synchronous_ function. The `MemoizeAsync` function can be used to memoize an _asynchronous_ function.

The `MemoizeAsync` function prevents duplicate evaluations by ensuring that multiple calls with identical parameters are only processed once.

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

The `Memoize` and `MemoizeAsync` functions accept an `Options` parameter to control the behaviour of the cache. Each option is optional. See the section below for the defaults:

```ts
const options = {
  // maximum number of items in the cache
  maxSize: 1000,

  // maximum number of milliseconds an item is to remain in the cache, undefined implies Infinity
  maxAge: undefined,

  // a function for generating the cache key (must return a String)
  resolver: (...args) => JSON.stringify(args),
};
```

## Tests

```bash
yarn test
```

## License

[MIT](LICENSE)
