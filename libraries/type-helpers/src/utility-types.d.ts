export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

/**
 * Restates `T`'s members as a type literal, which carries the implicit index
 * signature an `interface` lacks — the shape that lets a namespace's members
 * merge onto an interface through `extends Flatten<typeof TheNamespace>`.
 *
 * The trailing `& {}` is for the reader, not the checker: it makes an error or a hover print the
 * members rather than the alias name. Keep it — deleting it changes nothing that type-checks, so
 * nothing will fail to tell you it is gone.
 */
export type Flatten<T> = {
    [K in keyof T]: T[K];
} & {};

export type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<
    ObjectType,
    Exclude<keyof ObjectType, KeysType>
>;
export type Mutable<BaseType, Keys extends keyof BaseType = keyof BaseType> = Simplify<
    // Pick just the keys that are not mutable from the base type.
    Except<BaseType, Keys> &
        // Pick the keys that should be mutable from the base type and make them mutable by removing the `readonly` modifier from the key.
        { -readonly [KeyType in keyof Pick<BaseType, Keys>]: Pick<BaseType, Keys>[KeyType] }
>;
export type IfEquals<X, Y, A, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

// eslint-disable-next-line @typescript-eslint/no-unused-vars

// Alternatively:
/*
type IfEquals<X, Y, A, B> =
    [2] & [0, 1, X] extends [2] & [0, 1, Y] & [0, infer W, unknown]
    ? W extends 1 ? B : A
    : B;
*/

export type WritableKeys<T> = {
    [K in keyof T]: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>;
}[keyof T];

export type ReadonlyKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>;
}[keyof T];
export type WritablePart<T> = Pick<T, WritableKeys<T>>;
export type MakeRequired<T, R extends keyof T> = Simplify<Partial<T> & Required<Pick<T, R>>>;
