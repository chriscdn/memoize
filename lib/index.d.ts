import QuickLRU from "quick-lru";
type Options<T extends any[], Return> = {
    maxSize: number;
    maxAge?: number;
    shouldCache: (returnValue: Return, key: string) => boolean;
    resolver: (...args: T) => string;
};
/**
 * Memoize a synchronous function.
 */
declare const Memoize: <Args extends unknown[], Return>(cb: (...args: Args) => Return, options?: Partial<Options<Args, Return>>) => {
    (...args: Args): Return;
    cache: QuickLRU<string, Return>;
};
/**
 * Memoize an asynchronous function.
 */
declare const MemoizeAsync: <Args extends unknown[], Return>(cb: (...args: Args) => Promise<Return>, options?: Partial<Options<Args, Return>>) => {
    (...args: Args): Promise<Return>;
    cache: QuickLRU<string, Return>;
};
export { Memoize, MemoizeAsync };
