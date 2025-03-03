import { describe, expect, it } from "vitest";
import { Memoize, MemoizeAsync } from "../src/index";

let addSyncCount = 0;
let addAsyncCount = 0;

const add = (x: number, y: number) => {
  addSyncCount += 1;
  return x + y;
};

const addAsync = async (x: number, y: number) => {
  addAsyncCount += 1;
  return x + y;
};

const _asyncThrowError = MemoizeAsync(async (x: number, y: number) => {
  addAsyncCount += 1;
  throw new Error("Boom!");
  return x + y;
});

const asyncThrowError = MemoizeAsync(async (x: number, y: number) => {
  try {
    await _asyncThrowError(x, y);
  } catch {
    return -1;
  }
});

describe("Memoization", () => {
  it("sync", async () => {
    const addCached = Memoize(add);

    expect(addCached(1, 2)).toBe(3);
    expect(addCached(1, 2)).toBe(3);
    expect(addCached(1, 2)).toBe(3);
    expect(addCached(1, 2)).toBe(3);
    expect(addCached(1, 2)).toBe(3);

    // different key here
    expect(addCached(2, 1)).toBe(3);
    expect(addSyncCount).toBe(2);
  });

  it("async", async () => {
    const addCachedAsync = MemoizeAsync(addAsync);

    await Promise.all([
      addCachedAsync(1, 2).then((value) => expect(value).toBe(3)),
      addCachedAsync(1, 2).then((value) => expect(value).toBe(3)),
      addCachedAsync(1, 2).then((value) => expect(value).toBe(3)),
      addCachedAsync(1, 2).then((value) => expect(value).toBe(3)),

      // different key here
      addCachedAsync(2, 1).then((value) => expect(value).toBe(3)),
    ]);

    expect(addAsyncCount).toBe(2);
    expect(addCachedAsync.cache.size).toBe(2);
  });

  it("resolver", () => {
    // This its the resolver function to ensure the same value is returned for
    // the same key.

    const addCachedSameKey = Memoize(add, { resolver: (x, y) => "key" });

    expect(addCachedSameKey(5, 7)).toBe(12);
    expect(addCachedSameKey(1, 1)).toBe(12);
    expect(addCachedSameKey(5, 1)).toBe(12);
  });

  it("async error", async () => {
    expect(await asyncThrowError(4, 3)).toBe(-1);
  });
});

describe("Memoization of Class methods", () => {
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

  it("Test1", () => {
    const obj = new AddClass();

    expect(obj.count).toBe(0);
    expect(obj.add(1, 2)).toBe(3);
    expect(obj.count).toBe(1);
    expect(obj.add(1, 2)).toBe(3);
    expect(obj.count).toBe(1);
    expect(obj.add(5, 2)).toBe(7);
    expect(obj.count).toBe(2);
  });
});
