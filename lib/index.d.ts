import QuickLRU from "quick-lru";
//#region src/index.d.ts
type CacheLike<K, V> = Pick<QuickLRU<K, V>, "clear" | "delete" | "evict" | "expiresIn" | "get" | "has" | "maxAge" | "maxSize" | "peek" | "resize" | "size">;
type Options<Args extends unknown[], Return> = {
  maxSize: number;
  maxAge?: number;
  shouldCache: (returnValue: Return, key: string) => boolean;
  ttl?: (value: Return, key: string) => number | null | undefined;
  resolver: (...args: Args) => string;
};
type OptionsAsync<Args extends unknown[], Return> = Options<Args, Return> & {
  refreshWhen?: (ttl: number, args: Args, value: Return) => boolean;
};
/**
 * Memoize a synchronous function.
 */
declare const Memoize: <Args extends unknown[], Return>(cb: (...args: Args) => Return, options?: Partial<Options<Args, Return>>) => {
  (...args: Args): Return;
  cache: CacheLike<string, Return>;
  clear: () => void;
  delete: (...args: Args) => boolean;
  expiresIn: (...args: Args) => number | undefined;
  has: (...args: Args) => boolean;
  set: (args: Args, value: Return, options?: {
    maxAge: number;
  }) => void;
};
/**
 * Memoize an asynchronous function.
 */
declare const MemoizeAsync: <Args extends unknown[], Return>(cb: (...args: Args) => Promise<Return>, options?: Partial<OptionsAsync<Args, Return>>) => {
  (...args: Args): Promise<Return>;
  cache: CacheLike<string, Return>;
  clear: () => void;
  delete: (...args: Args) => boolean;
  expiresIn: (...args: Args) => number | undefined;
  has: (...args: Args) => boolean;
  set: (args: Args, value: Return, options?: {
    maxAge: number;
  }) => void;
};
//#endregion
export { Memoize, MemoizeAsync };
//# sourceMappingURL=index.d.ts.map