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
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

/**
 * Runs `fn` with this package's own `sideEffects` manifest field temporarily
 * removed from disk, then restores the original file byte-for-byte (even on
 * throw).
 *
 * `sideEffects: false`/an array is correct PUBLISHED metadata -- a hint to a
 * DOWNSTREAM consumer's bundler that importing this package for its side
 * effects is safe to elide. The bug: `bun build` also reads it from THIS
 * package's own package.json and applies it to the package's OWN internal
 * re-export graph, dropping a re-exported class/function body while its name
 * survives in the `export {}` list -- a bundle that throws `ReferenceError`
 * on import. Verified: without this, proxy-base's dist/bundle/index.js was 5
 * lines (an export statement, no declarations).
 *
 * `ignoreDCEAnnotations: true` (Bun's own documented escape hatch for exactly
 * this -- "package.json sideEffects fields... temporary workaround for
 * incorrect annotations") was tried FIRST and verified NOT to fix it (bun
 * 1.3.14, both the JS API option and the `--ignore-dce-annotations` CLI
 * flag): reproduced in isolation, `sideEffects: false` still drops the body
 * with the flag set either way. Only removing the field from the manifest
 * bun actually reads at build time works, hence this temporary strip.
 */
function withoutSideEffectsField<T>(dir: string, fn: () => T): T {
  const manifestPath = `${dir}/package.json`;
  const original = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(original) as Record<string, unknown>;
  if (!('sideEffects' in manifest)) {
    return fn();
  }
  const { sideEffects: _sideEffects, ...stripped } = manifest;
  writeFileSync(manifestPath, JSON.stringify(stripped, null, 2) + '\n');
  try {
    return fn();
  } finally {
    writeFileSync(manifestPath, original);
  }
}

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
    // Shells out to the `bun build` CLI rather than calling the in-process
    // `Bun.build()` JS API: verified the JS API does NOT see the sideEffects
    // strip above within the same process (its resolver/manifest cache is
    // stale for the just-written file even though a byte-identical write from
    // a fresh `bun build` CLI invocation picks it up correctly) -- reproduced
    // directly, so this is a real bun 1.3.14 in-process-API caching gap, not
    // a guess.
    const buildArgs = ['build', ...jsEntrypoints, '--outdir', bundleDir, '--target', 'node', '--format', 'esm'];
    for (const specifier of external) {
      buildArgs.push('--external', specifier);
    }
    const js = withoutSideEffectsField(dir, () => spawnSync('bun', buildArgs, { cwd: dir, stdio: 'inherit' }));
    if (js.status !== 0) {
      throw new Error(`${name}: bun build failed`);
    }
    // Load smoke: a green `bun build` only means bundling didn't throw, not
    // that the emitted module is importable (the DCE bug above exited 0 with
    // no errors for a bundle that threw on import). Every JS entrypoint gets
    // a real `import()` here so this class of failure can't report green again.
    for (const entry of entrypoints) {
      const outFile = `${bundleDir}/${entry.replace(/^src\//, '').replace(/\.ts$/, '.js')}`;
      try {
        await import(outFile);
      } catch (error) {
        throw new Error(`${name}: built bundle ${outFile} failed to load -- ${String(error)}`);
      }
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
