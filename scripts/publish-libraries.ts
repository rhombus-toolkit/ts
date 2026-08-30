// Topological publish helper for the @rhombus-toolkit libraries.
//
// Independent versioning (NOT std's lockstep): every publishable library ships
// its OWN version, bumped independently by release-please from conventional
// commits, and release-please writes the new number straight into each
// package's own manifest before this script ever runs. Only a subset of the
// workspace moves on any given release, so publishing is NOT "ship whatever's
// committed" -- a package whose manifest version is already live on npm makes
// `npm stage publish` fail with "cannot publish over the previously published
// versions", which aborts the whole run (that killed the 2026-08-16 release on
// `@rhombus-toolkit/fetch@1.3.9`).
//
// The released set therefore comes from release-please itself, not from the
// filesystem: the `RELEASED_PATHS` env var carries its `paths_released` output
// verbatim -- a JSON array of repo-relative component paths like
// `["libraries/obj","libraries/types"]` -- and `--publish` ships exactly those,
// still in topological order. `--publish` REFUSES to run when `RELEASED_PATHS`
// is unset or malformed rather than falling back to "everything": defaulting to
// the full workspace is precisely the bug this gate exists to stop, and the
// only caller that legitimately has no released set is a local invocation that
// should be using `--list`.
//
// Package discovery + Kahn's-algorithm tiering are unchanged from std's shape:
// PUBLISHABLE = has a `publishConfig` key and isn't `"private": true`, tiered
// over `workspace:*` deps so a package never ships before a sibling it depends
// on. Ordering matters here specifically because a dependent's packed tarball
// embeds the dependency's CURRENT version (see the pnpm pack note below), so
// publishing out of order would ship a tarball pinned to a version not yet live.
//
// STAGED, not direct, publish. Every @rhombus-toolkit package's npm Trusted
// Publisher allows both `npm publish` and `npm stage publish`; this script
// deliberately uses the latter. `npm stage publish` uploads the tarball
// without going live -- the version sits pending until a human runs
// `npm stage approve <id>`, which DOES require 2FA (OIDC trust tokens can
// stage but cannot approve -- verified against npm's staged-publish docs).
// That makes an 11-package release atomic in the way that matters: a
// mid-sequence CI failure leaves everything staged so far merely PENDING, not
// live, so there's no partial release to unwind -- reject the bad ones, fix,
// rerun.
//
// `pnpm pack`, not `pnpm publish`: pnpm has no staged-publish mode as of pnpm
// 10.34 (pnpm/pnpm#13183, open). `pnpm pack` alone already does the two things
// that matter -- applies the publishConfig dist-swap and rewrites `workspace:*`
// dependency ranges to the sibling's current concrete version (both verified
// against this repo's manifests) -- neither of which plain `npm pack` does.
// `npm stage publish <tarball>` then uploads exactly that tarball; npm never
// re-derives publishConfig itself, so pnpm has to have done it already.
//
// Two modes:
//   --list      print publishable names, topological order, one per line --
//               the FULL inventory, deliberately unfiltered by release state,
//               since callers use it to enumerate what this repo can publish
//   --publish   pnpm pack + npm stage publish each RELEASED package, in order
//
// A failed pack/stage exits non-zero immediately.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

interface Manifest {
  readonly name: string;
  readonly private?: boolean;
  readonly publishConfig?: Record<string, unknown>;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
}

interface Package {
  readonly name: string;
  /** Absolute path to the package directory (cwd for pnpm/npm invocations). */
  readonly dir: string;
  /** Repo-relative directory, the spelling release-please uses in `paths_released` (e.g. `libraries/obj`). */
  readonly path: string;
  /** Workspace-sibling package names this one depends on (any dependency kind). */
  readonly deps: readonly string[];
}

const ROOT = `${import.meta.dir}/..`;
const GROUP = 'libraries';

/** Yields the workspace-protocol dependency names across every dependency kind. */
function* workspaceDeps(manifest: Manifest): Generator<string> {
  const fields = [manifest.dependencies, manifest.devDependencies, manifest.peerDependencies];
  for (const field of fields) {
    for (const [name, spec] of Object.entries(field ?? {})) {
      if (String(spec).startsWith('workspace:')) {
        yield name;
      }
    }
  }
}

/** Reads every publishable library manifest (has `publishConfig`, not `private`) into a name -> Package map. */
function discoverPackages(): Map<string, Package> {
  const packages = new Map<string, Package>();
  let entries: string[];
  try {
    entries = readdirSync(`${ROOT}/${GROUP}`);
  } catch {
    return packages;
  }
  for (const entry of entries) {
    const dir = `${ROOT}/${GROUP}/${entry}`;
    let manifest: Manifest;
    try {
      manifest = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8')) as Manifest;
    } catch {
      continue;
    }
    // Publishable = has publishConfig and is not private. `typed-pluralizer`
    // carries neither field on purpose -- see its manifest comment.
    if (!manifest.publishConfig || manifest.private) {
      continue;
    }
    const deps = [...new Set(workspaceDeps(manifest))];
    packages.set(manifest.name, { name: manifest.name, dir, path: `${GROUP}/${entry}`, deps });
  }
  return packages;
}

/**
 * Peels the graph into dependency tiers (Kahn's algorithm): tier 0 depends on
 * nothing publishable, tier N depends only on tiers < N. Throws on a cycle.
 * A package's dependencies on non-publishable siblings don't gate its ordering.
 */
function computeTiers(packages: Map<string, Package>): string[][] {
  const pending = new Map<string, Set<string>>();
  for (const pkg of packages.values()) {
    pending.set(pkg.name, new Set(pkg.deps.filter((dep) => packages.has(dep))));
  }

  const tiers: string[][] = [];
  while (pending.size) {
    const tier = [...pending].filter(([, deps]) => !deps.size).map(([name]) => name);
    if (!tier.length) {
      throw new Error(`publish-libraries: dependency cycle among ${[...pending.keys()].join(', ')}`);
    }
    for (const name of tier) {
      pending.delete(name);
    }
    for (const deps of pending.values()) {
      for (const name of tier) {
        deps.delete(name);
      }
    }
    tiers.push(tier.sort());
  }
  return tiers;
}

const packages = discoverPackages();
const tiers = computeTiers(packages);
const ordered = tiers.flat().map((name) => packages.get(name)!);

const mode = process.argv[2];

if (mode === '--list') {
  for (const pkg of ordered) {
    console.log(pkg.name);
  }
  process.exit(0);
}

if (mode !== '--publish') {
  console.error('usage: publish-libraries.ts --list | --publish');
  process.exit(2);
}

interface PackResult {
  readonly filename: string;
}

/**
 * Release-please's `paths_released` for this run, from `RELEASED_PATHS`.
 * Missing or malformed exits non-zero rather than defaulting to the whole
 * workspace -- see the header note on why "everything" is never the fallback.
 */
function readReleasedPaths(): ReadonlySet<string> {
  const raw = process.env.RELEASED_PATHS?.trim();
  if (!raw) {
    console.error(
      "publish-libraries: RELEASED_PATHS is unset -- refusing to publish. It must carry release-please's `paths_released` output.",
    );
    process.exit(2);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`publish-libraries: RELEASED_PATHS is not valid JSON: ${raw}`);
    process.exit(2);
  }
  if (!Array.isArray(parsed) || parsed.some((path) => typeof path !== 'string')) {
    console.error(`publish-libraries: RELEASED_PATHS is not an array of paths: ${raw}`);
    process.exit(2);
  }
  return new Set(parsed as string[]);
}

/** `pnpm pack`'s tarball path -- the publishConfig-rewritten package npm will stage. */
function packTarball(pkg: Package, destDir: string): string {
  const result = spawnSync('pnpm', ['pack', '--json', '--pack-destination', destDir], { cwd: pkg.dir });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return (JSON.parse(result.stdout.toString()) as PackResult).filename;
}

const released = readReleasedPaths();
const selected = ordered.filter((pkg) => released.has(pkg.path));

// Skipping silently reads as "published everything" in a CI log, so every
// omission is accounted for -- both packages this release didn't touch and
// released paths that map to nothing publishable.
for (const pkg of ordered) {
  if (!released.has(pkg.path)) {
    console.log(`- skip ${pkg.name} -- ${pkg.path} not in this release`);
  }
}
for (const path of released) {
  if (!ordered.some((pkg) => pkg.path === path)) {
    console.warn(`publish-libraries: released path ${path} matches no publishable package -- ignoring`);
  }
}

if (!selected.length) {
  console.log('publish-libraries: nothing released is publishable -- nothing to stage');
  process.exit(0);
}

const destDir = mkdtempSync(`${tmpdir()}/rhombus-publish-`);

for (const pkg of selected) {
  console.log(`\n▶ stage ${pkg.name}`);
  const tarball = packTarball(pkg, destDir);
  const stage = spawnSync('npm', ['stage', 'publish', tarball, '--provenance'], { cwd: pkg.dir, stdio: 'inherit' });
  if (stage.status !== 0) {
    process.exit(stage.status ?? 1);
  }
}
