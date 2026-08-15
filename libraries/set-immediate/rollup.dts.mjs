// Rolls the public type surface of @rhombus-toolkit/set-immediate into a
// single dist/bundle/index.d.ts. No `external` entries -- `setimmediate` is
// bundled at the JS layer and its ambient types don't appear in the public
// surface (the exports are plainly typed functions, not the polyfill's types).

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
