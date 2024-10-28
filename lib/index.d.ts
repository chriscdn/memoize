type Options<T extends any[]> = {
    maxSize: number;
    maxAge?: number;
    resolver: (...args: T) => string;
};
/**
 * Memoize a synchronous function.
 *
 * @template {any[]} Args
 * @template {{}} Return
 * @param {(...args: Args) => Return} cb
 * @param {Partial<Options<Args>>} [options={}]
 * @returns {Return, options?: Partial<Options<Args>>) => (...args: Args) => Return}
 */
declare const Memoize: <Args extends any[], Return extends {}>(cb: (...args: Args) => Return, options?: Partial<Options<Args>>) => (...args: Args) => Return;
/**
 * Memoize an asynchronous function.
 *
 * This differs from the sychronous case by ensuring multiple calls with the
 * same arguments is only evaluated once. This is controlled by using a
 * semaphore, which forces redundant calls to wait until the first call
 * completes.
 *
 * @param cb
 * @param options
 * @returns
 */
declare const MemoizeAsync: <Args extends any[], Return extends {}>(cb: (...args: Args) => Promise<Return>, options?: Partial<Options<Args>>) => (...args: Args) => Promise<Return>;
export { Memoize, MemoizeAsync };
