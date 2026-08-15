// Rolls this package's `./generic` entry into a single
// dist/bundle/generics.d.ts. Same shim story as rollup.dts.mjs, and here the
// explicit `external` is not just tidiness: `$` is a `unique symbol`, so an
// inlined copy would be a DIFFERENT symbol from
// @rhombus-toolkit/types/generic's, and a consumer holding both would find the
// placeholder from one rejected by the other.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'generics.ts'), external: ['@rhombus-toolkit/types/generic'],
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'generics.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json'), respectExternal: true })] };
