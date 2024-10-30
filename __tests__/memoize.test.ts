import { expect, test } from "vitest";
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

test("sync", async () => {
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

test("async", async () => {
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
});

test("resolver", () => {
  // This tests the resolver function to ensure the same value is returned for
  // the same key.

  const addCachedSameKey = Memoize(add, { resolver: (x, y) => "key" });

  expect(addCachedSameKey(5, 7)).toBe(12);
  expect(addCachedSameKey(1, 1)).toBe(12);
  expect(addCachedSameKey(5, 1)).toBe(12);
});
