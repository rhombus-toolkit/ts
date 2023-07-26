


type InferArgs<F extends NodeStyleFn> = F extends NodeStyleFn<infer args, any> ? args : never;
type InferResult<F extends NodeStyleFn> = F extends NodeStyleFn<any, infer result> ? result : never;

type Callback<TResult = any, TError = any> = (error: TError, result: TResult) => void;
type NodeStyleFn<Args extends readonly any[] = any[], TResult = any> = (...args:readonly [...args:Args, callback: Callback<TResult>])=>void;

export function nodeCallbackToAsync<T extends NodeStyleFn>(fn: T) {
    return (...args: InferArgs<T>) => new Promise<InferResult<T>>((resolve, reject) => {
        fn(...args, (err: any, result: any) => {
            if (err !== undefined) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
