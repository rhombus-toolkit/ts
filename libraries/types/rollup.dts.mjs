// Rolls the public type surface of @rhombus-toolkit/types' `.` entry into a
// single dist/bundle/index.d.ts. This package is types-only -- there is no JS
// bundle, only the d.ts rolls (see the `rhombusBuild.typesOnly` manifest
// field). No `external` entries: it is a leaf with zero workspace dependencies.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
