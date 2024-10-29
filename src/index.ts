import Semaphore from "@chriscdn/promise-semaphore";
import QuickLRU from "quick-lru";

const kDefaultMaxSize = 1000;

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
const Memoize = <Args extends any[], Return extends {}>(
    cb: (...args: Args) => Return,
    options: Partial<Options<Args>> = {},
) => {
    const maxAge: number | undefined = options.maxAge;
    const maxSize = options.maxSize ?? kDefaultMaxSize;

    const resolver = options.resolver ??
        ((...args: Args) => JSON.stringify(args));

    const cache = new QuickLRU<string, Return>({
        maxAge,
        maxSize,
    });

    return (...args: Args): Return => {
        const key = resolver(...args);

        if (cache.has(key)) {
            return cache.get(key);
        } else {
            const returnValue = cb(...args);
            cache.set(key, returnValue);
            return returnValue;
        }
    };
};

/**
 * Memoize an asynchronous function.
 *
 * This differs from the sychronous case by ensuring multiple calls with the
 * same arguments is only evaluated once. This is controlled by using a
 * semaphore, which forces redundant calls to wait until the first call
 * completes.
 *
 * @template {any[]} Args
 * @template {{}} Return
 * @param {(...args: Args) => Promise<Return>} cb
 * @param {Partial<Options<Args>>} [options={}]
 * @returns {Promise<Return>, options?: Partial<Options<Args>>) => (...args: Args) => Promise<Return>}
 */
const MemoizeAsync = <Args extends any[], Return extends {}>(
    cb: (...args: Args) => Promise<Return>,
    options: Partial<Options<Args>> = {},
) => {
    const maxAge: number | undefined = options.maxAge;
    const maxSize = options.maxSize ?? kDefaultMaxSize;

    const resolver = options.resolver ??
        ((...args: Args) => JSON.stringify(args));

    const semaphore = new Semaphore();

    const cache = new QuickLRU<string, Return>({
        maxAge,
        maxSize,
    });

    return async (...args: Args): Promise<Return> => {
        const key = resolver(...args);

        if (cache.has(key)) {
            return cache.get(key)!;
        } else {
            try {
                await semaphore.acquire(key);

                if (cache.has(key)) {
                    return cache.get(key);
                } else {
                    const returnValue = await cb(...args);
                    cache.set(key, returnValue);
                    return returnValue;
                }
            } finally {
                semaphore.release(key);
            }
        }
    };
};

export { Memoize, MemoizeAsync };
