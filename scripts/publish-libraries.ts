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
// DIRECT publish -- deliberately NOT `npm stage publish`. Staging defers
// proof-of-presence to a human running `npm stage approve <id>`, which needs 2FA
// that OIDC trust tokens cannot satisfy, so a staged pipeline can never complete
// unattended. Every @rhombus-toolkit package's npm Trusted Publisher permits
// both; this script uses the one that finishes on its own.
//
// The dist-tag is derived per package, never assumed: a stable version goes to
// `latest`, a prerelease to its own identifier (`1.2.0-placeholder.0` ->
// `placeholder`), which is the convention already on npm for this repo's
// reservation placeholders. npm REFUSES a prerelease publish that carries no
// `--tag` at all, so the derivation is what makes a prerelease publishable here.
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
// A failure does NOT abandon the rest of the run. Every package is attempted and
// the failures are reported together at the end, non-zero -- one broken package
// used to strand every package behind it in the topological order, packages with
// nothing wrong with them. The single exception is a package that DEPENDS on one
// that failed: its tarball pins the version that never landed, so publishing it
// would install as a hard resolution failure in a consumer's project. Those are
// skipped, and reported apart from the ordinary already-live skip.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

interface Manifest {
  readonly name: string;
  readonly version: string;
  readonly private?: boolean;
  readonly publishConfig?: Record<string, unknown>;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
}

interface Package {
  readonly name: string;
  /** The manifest version this run would publish, used to record it live for dependents packed later. */
  readonly version: string;
  /** Absolute path to the package directory (cwd for pnpm/npm invocations). */
  readonly dir: string;
  /** Repo-relative directory, the spelling release-please uses in `paths_released` (e.g. `libraries/obj`). */
  readonly path: string;
  /** Workspace-sibling package names this one depends on (any dependency kind). */
  readonly deps: readonly string[];
}

/** What a run decided about one package, in the order the walk reached it. */
export type PublishOutcome = 'published' | 'already-live' | 'failed' | 'blocked';

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
    packages.set(manifest.name, { name: manifest.name, version: manifest.version, dir, path: `${GROUP}/${entry}`,
      deps });
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

/**
 * The npm dist-tag a version publishes under -- `latest` for a stable release, the version's own
 * prerelease identifier otherwise (`2.0.0-rc.1` -> `rc`).
 *
 * @remarks
 * `undefined` for a prerelease whose identifier is purely numeric (`1.0.0-0`): it names no channel,
 * and npm rejects a dist-tag that parses as a semver range anyway.
 */
export function deriveDistTag(version: string): string | undefined {
  const prerelease = /^[^-+]+-([^+]+)/.exec(version)?.[1];
  if (prerelease === undefined) {
    return 'latest';
  }
  const identifier = prerelease.split('.')[0] ?? '';
  return /^\d+$/.test(identifier) || !identifier ? undefined : identifier;
}

/**
 * The first dependency whose own outcome stops this package from being publishable, if any.
 *
 * @remarks
 * Reaches transitive stranding for free while the walk is in topological order: a dependency
 * blocked by ITS dependency is already recorded `blocked` by the time a dependent is looked at.
 */
export function findBlockingDependency(deps: Iterable<string>, outcomes: ReadonlyMap<string, PublishOutcome>): string
  | undefined
{
  return Iterator.from(deps).find((dep) => outcomes.get(dep) === 'failed' || outcomes.get(dep) === 'blocked');
}

interface PackResult {
  readonly filename: string;
}

/** `pnpm pack`'s tarball path -- the publishConfig-rewritten package npm will stage. */
function packTarball(pkg: Package, destDir: string): string | undefined {
  const result = spawnSync('pnpm', ['pack', '--json', '--pack-destination', destDir], { cwd: pkg.dir });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    return undefined;
  }
  return (JSON.parse(result.stdout.toString()) as PackResult).filename;
}

/** Whether npm rejected this publish only because the version is already live. */
function isAlreadyPublished(output: string): boolean {
  return /cannot publish over|previously published version|EPUBLISHCONFLICT|E409/i.test(output);
}

/**
 * The `@rhombus-toolkit/*` versions a packed tarball pins, read back out of it.
 *
 * @remarks
 * `pnpm pack` rewrites each `workspace:*` range to whatever the sibling's manifest currently says,
 * which is only correct while every manifest matches what is live. A manifest left BEHIND npm --
 * reverted, or bumped out-of-band -- produces a tarball pinning a version that was never published,
 * and npm accepts it: the break surfaces at install time in a consumer's project rather than here.
 */
function pinnedSiblings(tarball: string): Record<string, string> {
  const show = spawnSync('tar', ['-xzOf', tarball, 'package/package.json']);
  if (show.status !== 0) {
    return {};
  }
  const manifest = JSON.parse(show.stdout.toString()) as Manifest;
  const pinned: Record<string, string> = {};
  for (const [name, spec] of Object.entries(manifest.dependencies ?? {})) {
    if (name.startsWith('@rhombus-toolkit/')) {
      pinned[name] = spec;
    }
  }
  return pinned;
}

type AttemptResult = { readonly outcome: 'published' | 'already-live'; } | { readonly outcome: 'failed';
  readonly reason: string; };

/**
 * Packs and publishes one package, reporting what happened rather than ending the run.
 *
 * @param live - every `name@version` this run has confirmed on npm, read and extended in place so a
 * sibling pinned by a later package costs at most one `npm view`.
 */
function attemptPublish(pkg: Package, destDir: string, live: Set<string>): AttemptResult {
  const distTag = deriveDistTag(pkg.version);
  if (distTag === undefined) {
    return { outcome: 'failed', reason: `version ${pkg.version} names no dist-tag to publish under` };
  }
  const tarball = packTarball(pkg, destDir);
  if (tarball === undefined) {
    return { outcome: 'failed', reason: 'pnpm pack failed' };
  }

  // Refuse before publishing rather than after: a tarball pinning an unpublished sibling installs
  // as a hard resolution failure downstream, and npm has no way to take it back.
  for (const [dep, version] of Object.entries(pinnedSiblings(tarball))) {
    if (live.has(`${dep}@${version}`)) {
      continue;
    }
    const check = spawnSync('npm', ['view', `${dep}@${version}`, 'version']);
    if (check.status === 0 && check.stdout.toString().trim()) {
      live.add(`${dep}@${version}`);
      continue;
    }
    return { outcome: 'failed',
      reason: `pins ${dep}@${version}, which is not on npm -- its manifest is behind what was published` };
  }

  const result = spawnSync('npm', ['publish', tarball, '--provenance', '--access', 'public', '--tag', distTag], {
    cwd: pkg.dir,
  });
  const output = `${result.stdout?.toString() ?? ''}${result.stderr?.toString() ?? ''}`;
  process.stdout.write(output);

  if (result.status === 0) {
    live.add(`${pkg.name}@${pkg.version}`);
    return { outcome: 'published' };
  }
  if (isAlreadyPublished(output)) {
    live.add(`${pkg.name}@${pkg.version}`);
    return { outcome: 'already-live' };
  }
  return { outcome: 'failed', reason: `npm publish exited ${result.status ?? 1}` };
}

function main(): void {
  const packages = discoverPackages();
  const ordered = computeTiers(packages).flat().map((name) => packages.get(name)!);
  const mode = process.argv[2];

  if (mode === '--list') {
    for (const pkg of ordered) {
      console.log(pkg.name);
    }
    return;
  }

  if (mode !== '--publish') {
    console.error('usage: publish-libraries.ts --list | --publish');
    process.exit(2);
  }

  const destDir = mkdtempSync(`${tmpdir()}/rhombus-publish-`);
  const outcomes = new Map<string, PublishOutcome>();
  const published: string[] = [];
  const alreadyLive: string[] = [];
  const blocked: { name: string; dependency: string; }[] = [];
  const failed: { name: string; reason: string; }[] = [];
  /** Versions this run has confirmed live -- either already on npm, or published moments ago. */
  const live = new Set<string>();

  for (const pkg of ordered) {
    console.log(`\n▶ ${pkg.name}`);

    const blocker = findBlockingDependency(pkg.deps, outcomes);
    if (blocker !== undefined) {
      console.log(`- skip ${pkg.name} -- ${blocker} did not publish in this run`);
      outcomes.set(pkg.name, 'blocked');
      blocked.push({ name: pkg.name, dependency: blocker });
      continue;
    }

    const result = attemptPublish(pkg, destDir, live);
    outcomes.set(pkg.name, result.outcome);
    if (result.outcome === 'published') {
      published.push(pkg.name);
    } else if (result.outcome === 'already-live') {
      // The manifest version is already live, so this package did not move in the
      // push being built. That is the steady state for most of the workspace on
      // any given commit, not a failure.
      console.log(`- skip ${pkg.name} -- version already on npm`);
      alreadyLive.push(pkg.name);
    } else {
      console.error(`publish-libraries: ${pkg.name} failed to publish -- ${result.reason}`);
      failed.push({ name: pkg.name, reason: result.reason });
    }
  }

  console.log(`\npublished: ${published.join(' ') || 'none'}`);
  console.log(`skipped:   ${alreadyLive.join(' ') || 'none'}`);
  if (blocked.length) {
    console.log('\nskipped -- a dependency did not publish in this run:');
    for (const entry of blocked) {
      console.log(`  - ${entry.name} (waiting on ${entry.dependency})`);
    }
  }
  if (failed.length) {
    console.error(`\nfailed to publish ${failed.length} package(s):`);
    for (const entry of failed) {
      console.error(`  - ${entry.name}: ${entry.reason}`);
    }
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
