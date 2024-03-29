import { defer } from "./defer";


enum State {
    'pending',
    'resolved',
    'rejected',
    'cancelled'
}


export interface AbortablePromise<T> extends Promise<T> {
    cancel(): void;
}

type Resolve<T> = (value: T) => void;
type Reject = (reason?: string) => void;


interface Executor<T> {
    (resolve: Resolve<T>, reject: Reject, signal: AbortSignal): void;
}


export class FnPromise<T> implements AbortablePromise<T> {

    [Symbol.toStringTag] = 'FnPromise';
    #promise: Promise<T>;
    #state = State.pending;
    #cancel = defer<any>();
    constructor(executor: Executor<T>) {
        this.#promise = new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          const ctrl = new AbortController();
            ctrl.signal.addEventListener('abort', ev => {
                if (this.#state !== State.pending) {
                    return;
                }
                this.#state = State.cancelled;
            })
            this.#cancel.promise.then(p => {
                if (!ctrl.signal.aborted) {
                  ctrl.abort(p);
                }
            });
            executor(
                /*resolve*/
                (value) => {
                    if (!this.isPending)
                        return;
                    this.#state = State.resolved;
                    resolve(value);
                    this.#cancel.reject('resolved');
                },
                /*reject*/
                (error) => {
                    if (this.#state !== State.pending)
                        return;
                    this.#state = State.rejected;
                    reject(error);
                    this.#cancel.reject('rejected');
                },
                ctrl.signal
            );
        });
    }

    get state() {
        return State[this.#state];
    }
    get isPending() {
        return this.#state === State.pending;
    }
    get isResolved() {
        return this.#state === State.resolved;
    }
    get isRejected() {
        return this.#state === State.rejected;
    }
    get isCancelled() {
        return this.#state === State.cancelled;
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>), onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
        return this.#promise.then(onfulfilled, onrejected);
    }
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>)): Promise<T | TResult> {
        return this.#promise.catch(onrejected);
    }

    finally(onfinally?: (() => void)): Promise<T> {
        return this.#promise.finally(onfinally);
    }

    nevermind<TResult = never>(onCancelled?: () => TResult | PromiseLike<TResult>): Promise<T | TResult> {
        return this.#cancel.promise.then(onCancelled);
    }

    cancel(reason?:any) {
        this.#cancel.resolve(reason);
    }
}
