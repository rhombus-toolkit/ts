// Shared publish-build logic for every libraries/* package.
//
// This repo standardized on `moduleResolution: bundler` + extensionless
// relative imports (see /tsconfig.base.json). A plain `tsc` emit would leave
// those specifiers extensionless in dist/, which plain Node ESM cannot
// resolve -- so every published package bundles instead of emitting raw tsc
// output:
//
//   1. dist/bundle/*.js    -- `bun build` bundles each ESM entry into a single
//      file with resolved specifiers. `external` keeps workspace deps out of
//      the bundle so cross-package identity (e.g. singleton state) isn't forked
//      by a private inlined copy.
//   2. dist/bundle/*.d.ts  -- rollup-plugin-dts rolls the public type surface
//      into one declaration file per configured rollup config.
//
// A types-only package (no runtime at all, e.g. func) sets `emitJs: false` --
// step 1 is skipped and only the d.ts roll runs.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

export interface BuildPackageOptions {
  /** The package root (pass `import.meta.dir`). */
  readonly dir: string;
  /** The package name, for error messages. */
  readonly name: string;
  /** Entrypoints relative to `dir`. Defaults to `["src/index.ts"]`. Ignored when `emitJs` is false. */
  readonly entrypoints?: readonly string[];
  /** Specifiers kept out of the JS bundle. Defaults to `[]` (bundle everything). */
  readonly external?: readonly string[];
  /** Emit the `bun build` JS bundle. Defaults to `true`; set `false` for a types-only package. */
  readonly emitJs?: boolean;
  /** rollup-plugin-dts config files relative to `dir`. Defaults to `["rollup.dts.mjs"]`. */
  readonly dtsConfigs?: readonly string[];
  /** Throw if `dist/bundle/index.js` exists after building -- the types-only invariant. */
  readonly assertNoJs?: boolean;
}

/** Builds one package's dist artifacts (JS bundle + rolled .d.ts). */
export async function buildPackage(options: BuildPackageOptions): Promise<void> {
  const { dir, name, entrypoints = ['src/index.ts'], external = [], emitJs = true, dtsConfigs = ['rollup.dts.mjs'],
    assertNoJs = false } = options;

  const dist = `${dir}/dist`;
  const bundleDir = `${dist}/bundle`;
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(bundleDir, { recursive: true });

  if (emitJs) {
    const jsEntrypoints = entrypoints.map((entry) => `${dir}/${entry}`);
    const js = await Bun.build({ entrypoints: jsEntrypoints, outdir: bundleDir, target: 'node', format: 'esm',
      external: [...external] });
    if (!js.success) {
      for (const log of js.logs) {
        console.error(log);
      }
      throw new Error(`${name}: bun build failed`);
    }
  }

  for (const config of dtsConfigs) {
    const dts = spawnSync('bun', ['x', 'rollup', '-c', `${dir}/${config}`], { cwd: dir, stdio: 'inherit' });
    if (dts.status !== 0) {
      throw new Error(`${name}: rollup d.ts bundling failed (${config})`);
    }
  }

  if (assertNoJs && existsSync(`${bundleDir}/index.js`)) {
    throw new Error(`${name}: unexpected runtime artifact dist/bundle/index.js -- this package is types-only`);
  }
}
