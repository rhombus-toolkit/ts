// Topological build runner for the workspace.
//
// `bun --filter '*' build` runs every package's build in PARALLEL with no
// ordering, which is wrong here: a package resolves its workspace siblings'
// types through the `types` export condition -- `./dist/bundle/index.d.ts` --
// under the non-editor tsconfig (tsconfig.ci.json has no `source`
// customCondition). If that upstream dist is missing or being rewritten while
// a dependent builds, its own typecheck gate (build-lib.ts runs `tsc --noEmit`
// before bundling) sees a stale or absent d.ts and fails or silently checks
// against nothing.
//
// This runner topologically orders the per-package `build` scripts by their
// workspace dependency graph and runs each tier to completion before the next
// begins, so every dependent sees a complete, stable upstream dist. A tier's
// packages have no ordering between them and build in parallel (one
// `bun --filter` invocation per tier).

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

interface Manifest {
  readonly name: string;
  readonly scripts?: Record<string, string>;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
}

interface Package {
  readonly name: string;
  readonly hasBuild: boolean;
  /** Workspace-sibling package names this one depends on (any dependency kind). */
  readonly deps: readonly string[];
}

const ROOT = `${import.meta.dir}/..`;
// The workspace groups from the root package.json `workspaces` globs: `libraries/*`
// is a directory of packages, `tests` is itself a single package (no glob).
const GLOB_GROUPS = ['libraries'];
const SINGLE_PACKAGES = ['tests'];

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

/** Reads one package.json into the packages map, if it parses. */
function addPackage(packages: Map<string, Package>, dir: string): void {
  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8')) as Manifest;
  } catch {
    return;
  }
  packages.set(manifest.name, { name: manifest.name, hasBuild: Boolean(manifest.scripts?.build),
    deps: [...new Set(workspaceDeps(manifest))] });
}

/** Reads every workspace package's manifest into a name -> Package map. */
function discoverPackages(): Map<string, Package> {
  const packages = new Map<string, Package>();
  for (const group of GLOB_GROUPS) {
    let entries: string[];
    try {
      entries = readdirSync(`${ROOT}/${group}`);
    } catch {
      continue;
    }
    for (const entry of entries) {
      addPackage(packages, `${ROOT}/${group}/${entry}`);
    }
  }
  for (const pkg of SINGLE_PACKAGES) {
    addPackage(packages, `${ROOT}/${pkg}`);
  }
  return packages;
}

/**
 * Peels the graph into dependency tiers (Kahn's algorithm): tier 0 depends on
 * nothing in the workspace, tier N depends only on tiers < N. Throws on a cycle.
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
      throw new Error(`build-all: dependency cycle among ${[...pending.keys()].join(', ')}`);
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

for (const tier of tiers) {
  const toBuild = tier.filter((name) => packages.get(name)?.hasBuild);
  if (!toBuild.length) {
    continue;
  }
  console.log(`\n▶ build tier: ${toBuild.join(', ')}`);
  const filters = toBuild.flatMap((name) => ['--filter', name]);
  const result = spawnSync('bun', [...filters, 'build'], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
