// Rolls this package's public type surface into a single
// dist/bundle/index.d.ts. case-converter is now a pure re-export shim for
// @rhombus-toolkit/types/string, and the explicit `external` is what keeps it
// one: `respectExternal: true` alone classifies by resolved path, and the
// sibling resolves through the `source` export condition to ../types/src, which
// rollup treats as internal and inlines.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'), external: ['@rhombus-toolkit/types/string'],
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json'), respectExternal: true })] };
