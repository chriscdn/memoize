import QuickLRU from 'quick-lru';

type CacheLike<K, V> = Pick<QuickLRU<K, V>, "clear" | "delete" | "evict" | "expiresIn" | "get" | "has" | "maxAge" | "maxSize" | "peek" | "resize" | "size">;
type Options<T extends unknown[], Return> = {
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
    cache: CacheLike<string, Return>;
    clear(): void;
    delete(...args: Args): boolean;
    expiresIn(...args: Args): number | undefined;
    has(...args: Args): boolean;
};
/**
 * Memoize an asynchronous function.
 */
declare const MemoizeAsync: <Args extends unknown[], Return>(cb: (...args: Args) => Promise<Return>, options?: Partial<Options<Args, Return>>) => {
    (...args: Args): Promise<Return>;
    cache: CacheLike<string, Return>;
    clear(): void;
    delete(...args: Args): boolean;
    expiresIn(...args: Args): number | undefined;
    has(...args: Args): boolean;
};

export { Memoize, MemoizeAsync };
