// Rolls the `./generic` entry (the $-placeholder Func/Ctor/AbstractCtor
// variants) into a single dist/bundle/generics.d.ts. Its `./func` import is a
// same-package relative specifier, so rollup-plugin-dts inlines it regardless
// of `respectExternal` -- there is nothing external to this leaf package.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'generics.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'generics.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
