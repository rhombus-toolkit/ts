// Derives every publishable library's `publishConfig` from its DEV `exports`,
// adapted from std's script of the same name. Matters more here than in std:
// the types package gains four subpaths in P3 (array/string/generic/guards),
// and hand-maintaining publishConfig for each one will drift silently.
//
// The derivation rule (confirmed against every hand-authored manifest in this
// repo today):
//
//   publishConfig.exports = exports, with two transforms:
//     1. SCRUB     -- any white-box subpath (`./tokens/*`, `./private/*`) is
//                     dropped. No package here declares one yet, but the
//                     mechanism carries forward for when one does.
//     2. DIST-SWAP -- each surviving subpath collapses its dev-resolution
//                     conditions to the published trio, in canonical order:
//                       types   <- the dev `types` condition (or `source`/
//                                  `default` as a fallback), dist-swapped
//                       import  <- present iff the dev entry has an `import`
//                                  condition (a runtime lib)
//                       default <- the dev `default` (or `import`/`bun`)
//                                  condition, dist-swapped
//                     The dev-only conditions (`source`, `bun`) are dropped --
//                     published consumers resolve through import/default/types
//                     only. In this repo's manifests `import`/`default`/`types`
//                     already point at `./dist/bundle/*` (only `source` points
//                     at raw `./src/*.ts`, for the editor's benefit -- see
//                     tsconfig.editor.json's `source` condition), so the swap
//                     is a no-op there and only bites the `source` fallback path.
//
//   Top-level publishConfig.main/module/types are the same dist-swap of the
//   top-level fields, emitted only for the fields the package actually declares
//   (a types-only package like func has no `main`).
//
//   Non-derived publishConfig fields (`access`, `provenance`) are preserved
//   verbatim -- they're publish policy, not derivable from `exports`.
//
// NON_DERIVABLE holds package names whose publishConfig is a deliberate
// semantic reshape of `exports`, not a mechanical dist-swap (std's
// @rhombus-std/config is the precedent). Empty today -- nothing in this repo
// needs it, but the escape hatch stays so a future reshape doesn't have to
// fight this script.
//
// Modes:
//   --check   exit non-zero listing packages whose publishConfig drifts from
//             the derived form (structural compare -- formatting-immune).
//   --write   rewrite publishConfig in place for any drifting package.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const ROOT = `${import.meta.dir}/..`;
const LIBS = `${ROOT}/libraries`;

const NON_DERIVABLE = new Set<string>();

interface Conditions {
  readonly [condition: string]: string;
}
type ExportEntry = string | Conditions;

interface Manifest {
  readonly name: string;
  readonly private?: boolean;
  readonly main?: string;
  readonly module?: string;
  readonly types?: string;
  readonly exports?: Record<string, ExportEntry>;
  readonly publishConfig?: Record<string, unknown>;
  readonly rhombusBuild?: { readonly typesOnly?: boolean; };
}

/** True for a white-box seam subpath dropped from the published surface. Both
 * halves are dev-only: `./tokens/*` (a source token surface) and `./private/*`
 * (a built lowered runtime) -- std's convention, unused here so far. */
function isInternal(subpath: string): boolean {
  return subpath.startsWith('./tokens/') || subpath.startsWith('./private/');
}

/**
 * Swap a dev path to its published dist target -- `./dist/bundle/` is where
 * build-lib.ts emits:
 *   kind 'js'  -> `./dist/bundle/<name>.js`   (runtime bundle)
 *   kind 'dts' -> `./dist/bundle/<name>.d.ts` (rolled declarations)
 * Idempotent: a value already under `./dist/bundle/` only has its extension
 * retargeted, which is the common case in this repo (see header comment).
 */
function toDist(path: string, kind: 'js' | 'dts'): string {
  const inDist = path.replace(/^\.\/src\//, './dist/bundle/');
  const ext = kind === 'dts' ? '.d.ts' : '.js';
  return inDist.replace(/\.(d\.ts|ts|js)$/, ext);
}

/** A package with no `.js` anywhere in its `.` conditions ships declarations only. */
function isTypesOnly(manifest: Manifest): boolean {
  if (manifest.rhombusBuild?.typesOnly) {
    return true;
  }
  const dot = manifest.exports?.['.'];
  if (dot === undefined || typeof dot === 'string') {
    return false;
  }
  return !Object.values(dot).some((value) => value.endsWith('.js'));
}

/** The published conditions trio for one surviving subpath (the dist-swap). */
function derivePublishedConditions(conditions: Conditions, typesOnly: boolean): Conditions {
  const typesSource = conditions.types ?? conditions.source ?? conditions.default;
  const out: Record<string, string> = {};
  out.types = toDist(typesSource, 'dts');
  if (conditions.import !== undefined) {
    out.import = toDist(conditions.import, 'js');
  }
  const defaultSource = conditions.default ?? conditions.import ?? conditions.bun;
  out.default = toDist(defaultSource, typesOnly ? 'dts' : 'js');
  return out;
}

/** The derived `publishConfig.exports` for a whole manifest (scrub + dist-swap). */
function derivePublishExports(manifest: Manifest): Record<string, ExportEntry> {
  const typesOnly = isTypesOnly(manifest);
  const out: Record<string, ExportEntry> = {};
  for (const [subpath, entry] of Object.entries(manifest.exports ?? {})) {
    if (isInternal(subpath)) {
      continue;
    }
    if (typeof entry === 'string') {
      out[subpath] = entry;
      continue;
    }
    out[subpath] = derivePublishedConditions(entry, typesOnly);
  }
  return out;
}

/** The full derived publishConfig: preserves policy fields, replaces the derived ones. */
function derivePublishConfig(manifest: Manifest): Record<string, unknown> {
  const existing = manifest.publishConfig ?? {};
  const derived: Record<string, unknown> = { ...existing };
  if (manifest.main !== undefined) {
    derived.main = toDist(manifest.main, 'js');
  }
  if (manifest.module !== undefined) {
    derived.module = toDist(manifest.module, 'js');
  }
  if (manifest.types !== undefined) {
    derived.types = toDist(manifest.types, 'dts');
  }
  derived.exports = derivePublishExports(manifest);
  return derived;
}

interface Lib {
  readonly name: string;
  readonly file: string;
  readonly manifest: Manifest;
}

/** Every publishable library: a `publishConfig` and not marked private. */
function discover(): Lib[] {
  const libs: Lib[] = [];
  for (const dir of readdirSync(LIBS)) {
    const file = `${LIBS}/${dir}/package.json`;
    let raw: string;
    try {
      raw = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const manifest = JSON.parse(raw) as Manifest;
    if (manifest.private || manifest.publishConfig === undefined) {
      continue;
    }
    libs.push({ name: manifest.name, file, manifest });
  }
  return libs.sort((a, b) => a.name.localeCompare(b.name));
}

/** Structural (formatting-immune) equality via canonical JSON. */
function equal(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function main(): void {
  const mode = process.argv[2];
  if (mode !== '--check' && mode !== '--write') {
    console.error('usage: derive-publish-config.ts --check | --write');
    process.exit(2);
  }

  const drifted: string[] = [];
  const written: string[] = [];

  for (const lib of discover()) {
    if (NON_DERIVABLE.has(lib.name)) {
      continue;
    }
    const derived = derivePublishConfig(lib.manifest);
    if (equal(derived, lib.manifest.publishConfig)) {
      continue;
    }
    drifted.push(lib.name);
    if (mode === '--write') {
      const next = { ...lib.manifest, publishConfig: derived };
      writeFileSync(lib.file, `${JSON.stringify(next, null, 2)}\n`);
      written.push(lib.name);
    }
  }

  if (mode === '--check') {
    if (drifted.length === 0) {
      console.log('publishConfig is in sync with exports for every publishable library.');
      return;
    }
    console.error('publishConfig drift (run `bun scripts/derive-publish-config.ts --write`):');
    for (const name of drifted) {
      console.error(`  - ${name}`);
    }
    process.exit(1);
  }

  if (written.length === 0) {
    console.log('No drift -- nothing rewritten.');
    return;
  }
  console.log(`Rewrote publishConfig for ${written.length} package(s):`);
  for (const name of written) {
    console.log(`  - ${name}`);
  }
}

main();
