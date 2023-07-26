


export type Func<in Args extends readonly any[] = any[], out Return = any> = (...args: Args) => Return;
export type AsyncFunc<in Args extends readonly any[] = any[], out Return = any> = Func<Args, Promise<Awaited<Return>>>;
// export type AsyncFunc<Args extends any[] = any[], out Return = any> = Func<Args, Promise<Return>>;

export type Action<in Args extends readonly any[] = any[]> = Func<Args, void>;
export type AsyncAction<in Args extends readonly any[] = any[]> = AsyncFunc<Args, void>;

export type Sub<in Args extends readonly any[] = any[]> = Action<Args>;
export type AsyncSub<in Args extends readonly any[] = any[]> = AsyncAction<Args>;

export interface Ctor<in Args extends readonly any[] = any[], out Instance = any> {
  new(...args: Args): Instance;
  prototype: Instance;
}

type _AbstractCtor<in Args extends readonly any[] = any[], out Instance = any> = abstract new (...args: Args) => Instance;
export interface AbstractCtor<in Args extends readonly any[] = any[], out Instance = any> extends _AbstractCtor<Args, Instance> {
  prototype: Instance;
}


