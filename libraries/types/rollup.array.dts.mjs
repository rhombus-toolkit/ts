// Rolls the `./array` entry (Head/Tail/Take/Skip/...) into a single
// dist/bundle/array.d.ts. Its `./Cast` import is a same-package relative
// specifier, so rollup-plugin-dts inlines it -- each subpath bundle stands
// alone.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'array.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'array.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
