// Rolls the public type surface of @rhombus-toolkit/restify into a single
// dist/bundle/index.d.ts.
//
// The explicit `external` list is what keeps @rhombus-toolkit/types a real
// import. `respectExternal: true` alone does NOT -- verified: it classifies by
// resolved path, and the sibling resolves through the `source` export condition
// (tsconfig.json) to ../types/src/index.ts, which rollup follows past the
// node_modules symlink and treats as internal. Matching the bare specifier
// before resolution is the only reliable way to say "this stays an import".

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'), external: ['@rhombus-toolkit/types'],
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json'), respectExternal: true })] };
