// Rolls this package's `.` entry into a single dist/bundle/index.d.ts.
// type-helpers is now a re-export shim over @rhombus-toolkit/types, /obj and
// /restify, so keeping those imports external is the whole point: inlining them
// would put a second, private copy of every declaration in the shim's bundle.
//
// The explicit `external` list is what does it. `respectExternal: true` alone
// does NOT -- verified against this very package, whose rolled output before
// this list was 1487 lines with ZERO import statements and `Func` declared
// inline. It classifies by resolved path, and a sibling resolves through the
// `source` export condition (tsconfig.json) to ../<pkg>/src/index.ts, which
// rollup follows past the node_modules symlink and treats as internal. Matching
// the bare specifier before resolution is the only reliable way to say "this
// stays an import".
//
// It matters beyond bundle size: restify's marker is a `unique symbol`, and an
// inlined copy is a DIFFERENT symbol -- two packages each holding one would
// reject each other's values.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'index.ts'),
  external: ['@rhombus-toolkit/obj', '@rhombus-toolkit/restify', '@rhombus-toolkit/types',
    '@rhombus-toolkit/types/array', '@rhombus-toolkit/types/string'],
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'index.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json'), respectExternal: true })] };
