// Topological publish helper for the @rhombus-toolkit libraries.
//
// Independent versioning (NOT std's lockstep): every publishable library ships
// its OWN version. Publishing is driven by the manifest version against npm
// rather than by release-please: `--publish` walks every publishable package
// and ships the ones whose version is not already live. A package whose version
// IS live comes back from npm as a duplicate and is skipped -- the steady state
// for most of the workspace on any given commit. That keeps the run idempotent,
// which is what lets it fire on EVERY push to main rather than only on a
// release merge, and means "only what changed" needs no release metadata: an
// unbumped package is a no-op by construction.
//
// No pre-flight `npm view` to decide what is live. A read that hangs wedges the
// whole run with no output, where a publish attempt that loses the race just
// reports the duplicate and moves on.
//
// DIRECT publish, straight to `latest` -- deliberately NOT `npm stage publish`.
// Staging defers proof-of-presence to a human running `npm stage approve <id>`,
// which needs 2FA that OIDC trust tokens cannot satisfy, so a staged pipeline
// can never complete unattended. Every @rhombus-toolkit package's npm Trusted
// Publisher permits both; this script uses the one that finishes on its own.
//
// Package discovery + Kahn's-algorithm tiering are unchanged from std's shape:
// PUBLISHABLE = has a `publishConfig` key and isn't `"private": true`, tiered
// over `workspace:*` deps so a package never ships before a sibling it depends
// on. Ordering matters here specifically because a dependent's packed tarball
// embeds the dependency's CURRENT version (see the pnpm pack note below), so
// publishing out of order would ship a tarball pinned to a version not yet live.
//
// `pnpm pack`, not `pnpm publish`: `pnpm pack` applies the publishConfig
// dist-swap and rewrites `workspace:*` dependency ranges to the sibling's
// current concrete version (both verified against this repo's manifests),
// neither of which plain `npm pack` does. `npm publish <tarball>` then uploads
// exactly that tarball; npm never re-derives publishConfig itself, so pnpm has
// to have done it already.
//
// Two modes:
//   --list      print publishable names, topological order, one per line
//   --publish   pnpm pack + npm publish each package whose version isn't live
//
// A failed pack, or a publish failure that is not a duplicate version, exits
// non-zero immediately.

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

/** `pnpm pack`'s tarball path -- the publishConfig-rewritten package npm will stage. */
function packTarball(pkg: Package, destDir: string): string {
  const result = spawnSync('pnpm', ['pack', '--json', '--pack-destination', destDir], { cwd: pkg.dir });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return (JSON.parse(result.stdout.toString()) as PackResult).filename;
}

/** Whether npm rejected this publish only because the version is already live. */
function isAlreadyPublished(output: string): boolean {
  return /cannot publish over|previously published version|EPUBLISHCONFLICT|E409/i.test(output);
}

const destDir = mkdtempSync(`${tmpdir()}/rhombus-publish-`);
const published: string[] = [];
const skipped: string[] = [];

for (const pkg of ordered) {
  console.log(`\n▶ ${pkg.name}`);
  const tarball = packTarball(pkg, destDir);
  const result = spawnSync('npm', ['publish', tarball, '--provenance', '--access', 'public'], { cwd: pkg.dir });
  const output = `${result.stdout?.toString() ?? ''}${result.stderr?.toString() ?? ''}`;
  process.stdout.write(output);

  if (result.status === 0) {
    published.push(pkg.name);
  } else if (isAlreadyPublished(output)) {
    // The manifest version is already live, so this package did not move in the
    // push being built. That is the steady state for most of the workspace on
    // any given commit, not a failure.
    console.log(`- skip ${pkg.name} -- version already on npm`);
    skipped.push(pkg.name);
  } else {
    console.error(`publish-libraries: ${pkg.name} failed to publish`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\npublished: ${published.join(' ') || 'none'}`);
console.log(`skipped:   ${skipped.join(' ') || 'none'}`);
