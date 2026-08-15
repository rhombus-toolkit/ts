// Rolls the public type surface of @rhombus-toolkit/func's `./generic` entry
// (the generic-constrained Func/Ctor/AbstractCtor variants) into a single
// dist/bundle/generics.d.ts. Its own `./index` import is a same-package
// relative specifier, so rollup-plugin-dts inlines it regardless of
// `respectExternal` -- there is nothing external to this leaf, types-only
// package.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'generics.d.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'generics.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
