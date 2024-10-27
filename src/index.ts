import { LRUCache } from "lru-cache";
import Semaphore from "@chriscdn/promise-semaphore";

type Options<T extends any[]> = {
    ttl?: LRUCache.Milliseconds;
    max: number;
    resolver: (...args: T) => string;
};

const kDefaultMax = 1000;

const Memoize = <Args extends any[], Return extends {}>(
    cb: (...args: Args) => Return,
    options: Partial<Options<Args>> = {},
) => {
    const ttl: number | undefined = options.ttl;
    const max = options.max ?? kDefaultMax;
    const resolver = (...args: Args) => JSON.stringify(args);

    const cache = new LRUCache<string, Return>({
        ttl,
        max,
    });

    return (...args: Args): Return => {
        const key = resolver(...args);

        if (cache.has(key)) {
            return cache.get(key)!;
        } else {
            const returnValue = cb(...args);
            cache.set(key, returnValue);
            return returnValue;
        }
    };
};

const MemoizeAsync = <Args extends any[], Return extends {}>(
    cb: (...args: Args) => Promise<Return>,
    options: Partial<Options<Args>> = {},
) => {
    const ttl: number | undefined = options.ttl;
    const max = options.max ?? kDefaultMax;
    const resolver = (...args: Args) => JSON.stringify(args);

    const semaphore = new Semaphore();

    const cache = new LRUCache<string, Return>({
        ttl,
        max,
    });

    return async (...args: Args): Promise<Return> => {
        const key = resolver(...args);

        if (cache.has(key)) {
            return cache.get(key)!;
        } else {
            try {
                await semaphore.acquire(key);

                if (cache.has(key)) {
                    return cache.get(key)!;
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
