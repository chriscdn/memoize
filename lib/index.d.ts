import QuickLRU from "quick-lru";
type Options<T extends any[]> = {
    maxSize: number;
    maxAge?: number;
    resolver: (...args: T) => string;
};
/**
 * Memoize a synchronous function.
 */
declare const Memoize: <Args extends unknown[], Return>(cb: (...args: Args) => Return, options?: Partial<Options<Args>>) => {
    (...args: Args): Return;
    cache: QuickLRU<string, Return>;
};
/**
 * Memoize an asynchronous function.
 *
 * This differs from the sychronous case by ensuring multiple calls with the
 * same arguments is only evaluated once. This is controlled by using a
 * semaphore, which forces redundant calls to wait until the first call
 * completes.
 */
declare const MemoizeAsync: <Args extends unknown[], Return>(cb: (...args: Args) => Promise<Return>, options?: Partial<Options<Args>>) => {
    (...args: Args): Promise<Return>;
    cache: QuickLRU<string, Return>;
};
export { Memoize, MemoizeAsync };
