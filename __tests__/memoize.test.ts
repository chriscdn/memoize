import { Memoize, MemoizeAsync } from "../src/index";

// const pause = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const add = (x: number, y: number) => {
  console.log(`Running add (${x}, ${y})`);
  return x + y;
};
const addCached = Memoize(add);

const addAsync = async (x: number, y: number) => {
  console.log(`Running addAsync (${x}, ${y})`);
  return x + y;
};
const addCachedAsync = MemoizeAsync(addAsync);

test("sync", async () => {
  expect(addCached(1, 2)).toBe(3);
  expect(addCached(1, 2)).toBe(3);
  expect(addCached(1, 2)).toBe(3);
  expect(addCached(1, 2)).toBe(3);
  expect(addCached(1, 2)).toBe(3);
  expect(addCached(1, 2)).toBe(3);
});

test("async", async () => {
  addCachedAsync(1, 2).then((value) => expect(value).toBe(3));
  addCachedAsync(1, 2).then((value) => expect(value).toBe(3));
  addCachedAsync(1, 2).then((value) => expect(value).toBe(3));
  addCachedAsync(1, 2).then((value) => expect(value).toBe(3));
  addCachedAsync(1, 2).then((value) => expect(value).toBe(3));
});
