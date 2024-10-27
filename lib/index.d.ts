import { LRUCache } from "lru-cache";
type Options<T extends any[]> = {
    ttl?: LRUCache.Milliseconds;
    max: number;
    resolver: (...args: T) => string;
};
declare const Memoize: <Args extends any[], Return extends {}>(cb: (...args: Args) => Return, options?: Partial<Options<Args>>) => (...args: Args) => Return;
declare const MemoizeAsync: <Args extends any[], Return extends {}>(cb: (...args: Args) => Promise<Return>, options?: Partial<Options<Args>>) => (...args: Args) => Promise<Return>;
export { Memoize, MemoizeAsync };
