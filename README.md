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

The package provides two functions: `Memoize` and `MemoizeAsync`.

```ts
import { Memoize, MemoizeAsync } from "@chriscdn/memoize";
```

- **`Memoize`** is used to memoize a _synchronous_ function.
- **`MemoizeAsync`** is used to memoize an _asynchronous_ function.

The cache is powered by [quick-lru](https://www.npmjs.com/package/quick-lru). Each call to `Memoize` or `MemoizeAsync` creates a new cache instance.

The `MemoizeAsync` function prevents duplicate evaluations by ensuring that multiple calls with the same cache key are processed only once.

By default, the cache key is generated by calling `JSON.stringify()` on the function arguments. This behavior can be customized (see below).

### Example (Synchronous)

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

You can also define the function in a single line:

```ts
const add = Memoize((x: number, y: number) => x + y);
```

### Example (Asynchronous)

Memoizing an asynchronous function is similar:

```ts
const _add = async (x: number, y: number) => x + y;

const add = MemoizeAsync(_add);

const result = await add(5, 7);
// 12
```

## Options

Both `Memoize` and `MemoizeAsync` accept an `options` parameter to control the cache behavior:

```ts
const add = MemoizeAsync(_add, options);
```

Available options (with defaults):

```ts
const options = {
  // Maximum number of items in the cache
  maxSize: 1000,

  // Maximum lifespan of an item in milliseconds; undefined means items never expire
  maxAge: undefined,

  // A synchronous function whether to add the returnValue to the cache.
  shouldCache: (returnValue: Return, key: string) => true,

  // A synchronous function to generate cache keys (must return a string)
  resolver: (...args) => JSON.stringify(args),
};
```

## Cache

The underlying [quick-lru](https://www.npmjs.com/package/quick-lru) instance is accessible via the `.cache` property on the memoized function:

```ts
const add = MemoizeAsync(_add);
const result = await add(5, 7);

console.log(add.cache.size === 1);
// true

// Clear the cache
add.cache.clear();
```

The values `null` and `undefined` are cached by default, but this behavior can be adjusted using the `shouldCache` option.

## Class Methods

Class methods can also be memoized, but this requires overriding the method within the constructor. Ensure you bind the method to the instance to maintain the correct context.

Here's an example where the `add` method is memoized by reassigning it within the constructor. This approach preserves access to instance properties (like `count`) and maintains the correct method signature in TypeScript:

```ts
class AddClass {
  count: number = 0;

  constructor() {
    this.add = Memoize(this.add.bind(this));
  }

  add(x: number, y: number) {
    this.count += 1;
    return x + y;
  }
}
```

Each memoized method in each class instance maintains its own cache.

## Tests

Run the tests using:

```bash
yarn test
```

## License

[MIT](LICENSE)
