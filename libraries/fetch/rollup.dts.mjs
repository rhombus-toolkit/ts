// Rolls the public type surface of @rhombus-toolkit/fetch into a single
// dist/bundle/index.d.ts. No cross-package imports today, but
// `respectExternal: true` keeps any that show up as real imports in the
// rolled output rather than inlining them.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json'), respectExternal: true })] };
