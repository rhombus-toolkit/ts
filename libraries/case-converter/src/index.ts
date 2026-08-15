/**
 * @deprecated Moved to `@rhombus-toolkit/types/string`. This package is a pure
 * re-export shim and will not be developed further.
 *
 * @remarks
 * `SnakeCase` always produced `FOO_BAR`, so it is `ConstantCase` in its new
 * home, and `SnakeCase` there is the real snake_case. The alias below keeps
 * *this* package's `SnakeCase` meaning exactly what it always meant — moving to
 * the new import is what changes it.
 */
export type { ConstantCase as SnakeCase, DashCase } from '@rhombus-toolkit/types/string';
