// Asserts that release-please's own bookkeeping still describes this workspace.
//
// Publishing is keyed on each `package.json` version against npm and is
// DELIBERATELY independent of release-please (see publish-libraries.ts). That
// independence is what keeps a release shippable when a release PR is stuck --
// and it is also what lets the two silently separate: with release PRs left
// unmerged, packages go live while `.release-please-manifest.json` still records
// the version before them, and release-please keeps proposing releases that are
// already published. Eight of twelve packages had drifted that way, one by a
// full major, before this check existed.
//
// Three assertions, all offline -- npm is never consulted, so this runs in
// `lint` alongside derive-publish-config.ts rather than in the release job:
//
//   1. PARITY   -- `.release-please-manifest.json["libraries/<name>"]` equals
//                  that package's `package.json` version. A release PR writes
//                  both in the same commit, so a mismatch means a version moved
//                  outside release-please. That is the drift itself.
//   2. COVERAGE -- every publishable library has a release-please-config.json
//                  entry AND a manifest entry, and neither file names a package
//                  that is no longer a publishable library.
//   3. NO PINS  -- no `release-as` anywhere in the config. A pin there is
//                  PERMANENT, not one-shot: release-please re-proposes that exact
//                  version on every subsequent release. Four packages carried one
//                  left over from the reorg, and it froze obj at 1.0.0 -- a
//                  breaking change would have re-released the same version.
//
// One mode, mirroring derive-publish-config.ts:
//   --check   exit non-zero listing every problem found.

import { readdirSync, readFileSync } from 'node:fs';

const ROOT = `${import.meta.dir}/..`;
const LIBS = `${ROOT}/libraries`;
const CONFIG_FILE = `${ROOT}/release-please-config.json`;
const MANIFEST_FILE = `${ROOT}/.release-please-manifest.json`;

interface Manifest {
  readonly version: string;
  readonly private?: boolean;
  readonly publishConfig?: Record<string, unknown>;
}

interface ReleasePleaseEntry {
  readonly 'release-as'?: string;
}

interface ReleasePleaseConfig {
  readonly 'release-as'?: string;
  readonly packages?: Record<string, ReleasePleaseEntry>;
}

interface Lib {
  /** Repo-relative directory -- the key both release-please files are indexed by. */
  readonly path: string;
  readonly version: string;
}

/** Every publishable library (has a `publishConfig`, not marked private), keyed by its repo-relative path. */
function discoverLibs(): Lib[] {
  const libs: Lib[] = [];
  for (const dir of readdirSync(LIBS)) {
    let raw: string;
    try {
      raw = readFileSync(`${LIBS}/${dir}/package.json`, 'utf8');
    } catch {
      continue;
    }
    const manifest = JSON.parse(raw) as Manifest;
    if (manifest.private || manifest.publishConfig === undefined) {
      continue;
    }
    libs.push({ path: `libraries/${dir}`, version: manifest.version });
  }
  return libs.sort((a, b) => a.path.localeCompare(b.path));
}

/** Every way the two release-please files disagree with the workspace, one sentence each. */
function* findProblems(): Generator<string> {
  const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as ReleasePleaseConfig;
  const released = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')) as Record<string, string>;
  const configured = config.packages ?? {};
  const libs = discoverLibs();
  const paths = new Set(libs.map((lib) => lib.path));

  for (const lib of libs) {
    const recorded = released[lib.path];
    if (!(lib.path in configured)) {
      yield `${lib.path}: publishable, but release-please-config.json has no entry -- `
        + `release-please will never propose a release for it.`;
    }
    if (recorded === undefined) {
      yield `${lib.path}: publishable, but .release-please-manifest.json has no entry -- `
        + `release-please has no released version to bump from.`;
    } else if (recorded !== lib.version) {
      yield `${lib.path}: package.json says ${lib.version}, .release-please-manifest.json says ${recorded}. `
        + `A release PR writes both together, so they only diverge when a version moved outside release-please.`;
    }
  }

  for (const path of Object.keys(configured)) {
    if (!paths.has(path)) {
      yield `${path}: release-please-config.json has an entry for something that is not a publishable library.`;
    }
  }
  for (const path of Object.keys(released)) {
    if (!paths.has(path)) {
      yield `${path}: .release-please-manifest.json has an entry for something that is not a publishable library.`;
    }
  }

  const pinned = [...(config['release-as'] === undefined ? [] : [['(config root)', config['release-as']] as const]),
    ...Object.entries(configured).filter(([, entry]) => entry['release-as'] !== undefined).map(([path, entry]) =>
      [path, entry['release-as']!] as const
    )];
  for (const [where, version] of pinned) {
    yield `${where}: release-please-config.json pins "release-as": "${version}". `
      + `A release-as pin is PERMANENT, not one-shot -- release-please proposes that exact version for every `
      + `subsequent release, so the next breaking change would re-release ${version}. Delete the pin; to force `
      + `one specific version once, put a \`Release-As: <version>\` footer on the commit instead.`;
  }
}

function main(): void {
  if (process.argv[2] !== '--check') {
    console.error('usage: check-release-please.ts --check');
    process.exit(2);
  }

  const problems = [...findProblems()];
  if (problems.length === 0) {
    console.log('release-please config and manifest agree with every publishable library.');
    return;
  }
  console.error('release-please bookkeeping is out of step with the workspace:');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

main();
