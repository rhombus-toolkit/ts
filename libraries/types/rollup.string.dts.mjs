// Rolls the `./string` entry (the Join/Split family, the char alphabet and the
// case converters) into a single dist/bundle/string.d.ts.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dts } from 'rollup-plugin-dts';

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));

export default { input: join(PKG_ROOT, 'src', 'string.ts'),
  output: { file: join(PKG_ROOT, 'dist', 'bundle', 'string.d.ts'), format: 'es' },
  plugins: [dts({ tsconfig: join(PKG_ROOT, 'tsconfig.json') })] };
