// Rolls the public type surface of @rhombus-toolkit/obj into a single
// dist/bundle/index.d.ts.
//
// The explicit `external` list is what keeps the workspace siblings as real
// imports. `respectExternal: true` alone does NOT -- verified: it classifies by
// resolved path, and a sibling resolves through the `source` export condition
// (tsconfig.json) to ../<pkg>/src/index.ts, which rollup follows past the
// node_modules symlink and treats as internal. Matching the bare specifier
// before resolution is the only reliable way to say "this stays an import".

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'),
  external: ['@rhombus-toolkit/type-guards', '@rhombus-toolkit/types'],
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json'), respectExternal: true })] };
