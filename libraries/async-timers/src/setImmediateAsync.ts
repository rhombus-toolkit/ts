import { clearImmediate, setImmediate } from '@rhombus-toolkit/platform';

export function setImmediateAsync(): Promise<void>;
export function setImmediateAsync(signal: AbortSignal): Promise<void>;
export function setImmediateAsync<T>(arg: T): Promise<T>;
export function setImmediateAsync<T>(signal: AbortSignal, arg: T): Promise<T>;
export function setImmediateAsync<T extends any[]>(...args: T): Promise<T>;
export function setImmediateAsync<T extends any[]>(signal: AbortSignal, ...args: T): Promise<T>;
export function setImmediateAsync(...args: any) {
  const [first, ...rest] = args;
  const signal = first instanceof AbortSignal ? first : undefined;
  const params = signal ? rest : args;
  return new Promise<any>((resolve, reject) => {
    signal?.throwIfAborted();
    const token = setImmediate(() => {
      signal?.removeEventListener('abort', abort);
      resolve(params.length <= 1 ? params[0] : params);
    });
    function abort() {
      clearImmediate(token);
      reject(signal!.reason);
    }
    signal?.addEventListener('abort', abort, { once: true });
  });
}
