


export type Func<Args extends readonly any[] = any[], Return = any> = (...args: Args) => Return;
export type AsyncFunc<Args extends readonly any[] = any[], Return = any> = Func<Args, Promise<Awaited<Return>>>;
// export type AsyncFunc<Args extends any[] = any[], Return = any> = Func<Args, Promise<Return>>;

export type Action<Args extends readonly any[] = any[]> = Func<Args, void>;
export type AsyncAction<Args extends readonly any[] = any[]> = AsyncFunc<Args, void>;

export type Sub<Args extends readonly any[] = any[]> = Action<Args>;
export type AsyncSub<Args extends readonly any[] = any[]> = AsyncAction<Args>;

export interface Ctor<Args extends readonly any[] = any[], Instance = any> {
  new(...args: Args): Instance;
  prototype: Instance;
}

type _AbstractCtor<Args extends readonly any[] = any[], Instance = any> = abstract new (...args: Args) => Instance;
export interface AbstractCtor<Args extends readonly any[] = any[], Instance = any> extends _AbstractCtor<Args, Instance> {
  prototype: Instance;
}


