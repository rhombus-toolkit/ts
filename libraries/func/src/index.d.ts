export type Func<in Args extends readonly any[] = any[], out Return = any, in This = unknown> = (this: This,
  ...args: Args) => Return;
export type AsyncFunc<in Args extends readonly any[] = any[], out Return = any, in This = unknown> = Func<Args,
  Promise<Awaited<Return>>, This>;
// export type AsyncFunc<Args extends any[] = any[], out Return = any> = Func<Args, Promise<Return>>;

export type Action<in Args extends readonly any[] = any[], in This = unknown> = Func<Args, void, This>;
export type AsyncAction<in Args extends readonly any[] = any[], in This = unknown> = AsyncFunc<Args, void, This>;

export type Sub<in Args extends readonly any[] = any[], in This = unknown> = Action<Args, This>;
export type AsyncSub<in Args extends readonly any[] = any[], in This = unknown> = AsyncAction<Args, This>;

export interface Ctor<in Args extends readonly any[] = any[], out Instance = any> {
  new(...args: Args): Instance;
  prototype: Instance;
}

type _AbstractCtor<in Args extends readonly any[] = any[], out Instance = any> = abstract new(
  ...args: Args
) => Instance;
export interface AbstractCtor<in Args extends readonly any[] = any[], out Instance = any>
  extends _AbstractCtor<Args, Instance>
{
  prototype: Instance;
}
