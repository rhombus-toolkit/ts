export function setTimeoutAsync(timeout: number): Promise<void>;
export function setTimeoutAsync(timeout: number, signal: AbortSignal): Promise<void>;
export function setTimeoutAsync<T>(timeout: number, arg: T): Promise<T>;
export function setTimeoutAsync<T>(timeout: number, signal: AbortSignal, arg: T): Promise<T>;
export function setTimeoutAsync<T extends any[]>(timeout: number, signal: AbortSignal, ...args: T): Promise<T>;
export function setTimeoutAsync<T extends any[]>(timeout: number, ...args: T): Promise<T>;
export function setTimeoutAsync(timeout: number, ...args: any) {
  const [first, ...rest] = args;
  const signal = first instanceof AbortSignal ? first : undefined;
  const params = signal ? rest : args;

  // The platform's own promisified form takes no signal, so it is only reachable without one.
  if (!signal && '__promisify__' in setTimeout) {
    return (setTimeout as any).__promisify__(timeout, params.length <= 1 ? params[0] : params);
  }

  return new Promise<any>((resolve, reject) => {
    signal?.throwIfAborted();
    const token = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve(params.length <= 1 ? params[0] : params);
    }, timeout);
    function abort() {
      clearTimeout(token);
      reject(signal!.reason);
    }
    signal?.addEventListener('abort', abort, { once: true });
  });
}
