// The duplicate-copy guard. Cross-package behavior here rides on module
// identity — the augmentation registry's state, the prototypes augmentations
// install onto — so a second loaded copy of a guarded package forks that state
// and misbehaves far from the cause. A guarded package's entry module calls
// `stampSingleInstance` at load: the first call records which copy loaded, and
// a genuinely different copy fails fast instead.

/**
 * Call once at the top of a package's entry module to fail fast when two
 * copies of that package end up loaded in one process.
 *
 * @remarks
 * A later call with the same `moduleUrl` is a no-op; a different `moduleUrl` throws.
 */
export function stampSingleInstance(packageName: string, moduleUrl: string): void {
  const key = Symbol.for(`rhombus-toolkit:${packageName}/instance`);
  const globals = globalThis as unknown as Record<symbol, unknown>;
  const existing = globals[key];
  if (existing === undefined) {
    globals[key] = moduleUrl;
    return;
  }
  if (existing === moduleUrl) {
    return;
  }
  throw new Error(
    `Two copies of ${packageName} are loaded in one process: ${String(existing)} (loaded first) and `
      + `${moduleUrl}. A second copy forks per-module state (the augmentation registry, class identity), `
      + `breaking cross-package behavior far from the cause. Deduplicate the dependency graph so exactly `
      + `one copy of ${packageName} resolves.`,
  );
}
