import { expect, test } from "vitest";
import { Memoize, MemoizeAsync } from "../src/index";

let addSyncCount = 0;
let addAsyncCount = 0;

const add = (x: number, y: number) => {
  addSyncCount += 1;
  return x + y;
};
const addCached = Memoize(add);

const addAsync = async (x: number, y: number) => {
  addAsyncCount += 1;
  return x + y;
};
const addCachedAsync = MemoizeAsync(addAsync);

test("sync", async () => {
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
