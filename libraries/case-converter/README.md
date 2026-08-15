# @rhombus-toolkit/case-converter — deprecated

Moved to [`@rhombus-toolkit/types`](../types)' `./string` entry, which also
carries the char alphabet this package kept private and the four cases it never
shipped (`CamelCase`, `PascalCase`, `KebabCase`, `TitleCase`). This package is
now a pure re-export shim; it will not be developed further.

```ts
// before
import type { DashCase, SnakeCase } from '@rhombus-toolkit/case-converter';

// after
import type { ConstantCase, DashCase } from '@rhombus-toolkit/types/string';
```

**`SnakeCase` is `ConstantCase` in the new home.** It always produced
`FOO_BAR`, never `foo_bar` — the name was the bug. The shim aliases it, so
importing from here keeps the old behaviour; the new `SnakeCase` is the real
snake_case.
