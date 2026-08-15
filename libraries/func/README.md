# @rhombus-toolkit/func — deprecated

Moved to [`@rhombus-toolkit/types`](../types). This package is now a pure
re-export shim so existing imports keep compiling; it will not be developed
further.

```ts
// before
import type { Ctor, Func } from '@rhombus-toolkit/func';
import type { $, Func } from '@rhombus-toolkit/func/generic';

// after
import type { Ctor, Func } from '@rhombus-toolkit/types';
import type { $, Func } from '@rhombus-toolkit/types/generic';
```

The declarations are unchanged — the same `Func`/`Ctor` symbols, re-exported
from their new home, so a codebase can move one import at a time.
