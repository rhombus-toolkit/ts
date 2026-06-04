export type Fu = `` | `` | `` | `` | `` | `` | `` | `` | `	` | `
` | `` | `` | `
` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | `` | ` ` | `!` | `"` | `#` | `$` | `%` | `&` | `'` | `(` | `)` | `*` | `+` | `,` | `-` | `.` | `/` | `0` | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `:` | `;` | `<` | `=` | `>` | `?` | `@` | `A` | `B` | `C` | `D` | `E` | `F` | `G` | `H` | `I` | `J` | `K` | `L` | `M` | `N` | `O` | `P` | `Q` | `R` | `S` | `T` | `U` | `V` | `W` | `X` | `Y` | `Z` | `[` | `\\` | `]` | `^` | `_` | `\`` | `a` | `b` | `c` | `d` | `e` | `f` | `g` | `h` | `i` | `j` | `k` | `l` | `m` | `n` | `o` | `p` | `q` | `r` | `s` | `t` | `u` | `v` | `w` | `x` | `y` | `z` | `{` | `|` | `}` | `~`;

export type Replace<S, P extends string, R extends string> =
    S extends `${infer X}${P}${infer Y}` ? `${X}${R}${Y}` : S;

type ClearStart<S, P extends string> =
    S extends `${P}${infer X}` ? X : S;
    export type ExtractEnding<S, P extends string> =
    S extends `${infer X}${P}` ? ClearStart<S, X> : never;
    export type ReplaceEnding<S, P extends string, R extends string> =
    S extends `${infer X}${ExtractEnding<S, P>}` ? `${X}${R}` : S;



    export type AnyOf<T> =
    T extends '' ? never :
    T extends `${infer X}${infer Y}` ? X | AnyOf<Y> : never;
    export type NoneOf<T> = Exclude<Fu, AnyOf<T>>;

export type Not<T extends string, U> =
    T extends U ? never : T;
