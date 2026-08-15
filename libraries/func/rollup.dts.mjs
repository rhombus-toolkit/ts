// Rolls the public type surface of @rhombus-toolkit/func's `.` entry into a
// single dist/bundle/index.d.ts. func is types-only -- there is no JS bundle,
// only this d.ts roll (see the `rhombusBuild.typesOnly` manifest field).

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.d.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
