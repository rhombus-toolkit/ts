// The single build entry point for every libraries/* package: each one's
// `build` script runs `bun ../../scripts/build-lib.ts` from its own directory,
// and this script derives the `buildPackage` arguments from the package's
// manifest instead of a per-package build.ts restating them.
//
// Derivation rules (each package's manifest is the source of truth):
//
//   - `external` = keys(dependencies) ∪ keys(peerDependencies). A workspace
//     runtime dep stays external so cross-package singletons aren't forked by
//     a private inlined copy. Anything NOT a dependency (i.e. a devDependency)
//     is inlined -- none of this repo's packages currently do that.
//   - `entrypoints` = src/index.ts plus, for every exports subpath whose
//     `import` condition points at a non-index dist/*.js, the matching
//     src/*.ts (today: none -- func's `./generic` subpath is types-only, see
//     the dtsConfigs derivation below).
//   - `dtsConfigs` = one rollup config per d.ts-producing entry (rollup.dts.mjs
//     for `.`, plus rollup.<entry>.dts.mjs per extra subpath), asserted by
//     existence. Matched against BOTH the `import` condition (a JS entry) and,
//     for a types-only package, the `types` condition alone (func's
//     `./generic` -- there is no JS to derive an entry from).
//
// The optional `rhombusBuild` manifest field carries the one per-package
// override this repo needs:
//
//   | field       | why                                                          |
//   |-------------|---------------------------------------------------------------|
//   | typesOnly   | pure-types package (func) -- no JS bundle, asserted           |

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { buildPackage } from './build-package';

interface RhombusBuild {
  /** Pure-types package: emit no JS bundle and assert none appears. */
  readonly typesOnly?: boolean;
}

interface Manifest {
  readonly name: string;
  readonly exports?: Record<string, string | Record<string, string>>;
  readonly dependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
  readonly rhombusBuild?: RhombusBuild;
}

const dir = process.cwd();
const manifest = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8')) as Manifest;
const typesOnly = manifest.rhombusBuild?.typesOnly ?? false;

// Typecheck gate first -- the publish pipeline never runs tsc itself (bun
// build + rollup-plugin-dts), so this is where type errors fail the build.
const typecheck = spawnSync('bun', ['x', 'tsc', '--noEmit', '-p', 'tsconfig.ci.json'], { cwd: dir, stdio: 'inherit' });
if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}

// Entrypoints + dtsConfigs: src/index.(ts|d.ts) + every exports subpath that
// resolves to a non-index dist/bundle artifact.
const entrypoints = ['src/index.ts'];
const dtsConfigs = ['rollup.dts.mjs'];
for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
  if (subpath === '.' || typeof target === 'string') {
    continue;
  }
  const jsMatch = /^\.\/dist\/bundle\/(?!index\.js$)(.+)\.js$/.exec(target.import ?? '');
  const dtsMatch = typesOnly ? /^\.\/dist\/bundle\/(?!index\.d\.ts$)(.+)\.d\.ts$/.exec(target.types ?? '') : null;
  const match = jsMatch ?? dtsMatch;
  if (!match) {
    continue;
  }
  const entry = match[1]!;
  if (jsMatch) {
    entrypoints.push(`src/${entry}.ts`);
  }
  const dts = `rollup.${entry}.dts.mjs`;
  if (!existsSync(`${dir}/${dts}`)) {
    throw new Error(`${manifest.name}: extra entrypoint ${entry} has no ${dts} (one rolled d.ts per entry)`);
  }
  dtsConfigs.push(dts);
}

// External: deps ∪ peers -- kept out of the bundle so a runtime workspace dep
// isn't privately forked.
const external = [
  ...new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]),
];

await buildPackage({ dir, name: manifest.name, entrypoints, external, dtsConfigs, emitJs: !typesOnly,
  assertNoJs: typesOnly });
