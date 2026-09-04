// The two decisions publish-libraries.ts makes without talking to npm: which dist-tag a version
// publishes under, and which packages a failure strands behind it.

import { describe, expect, it } from 'bun:test';

import { deriveDistTag, findBlockingDependency, type PublishOutcome } from './publish-libraries';

describe('deriveDistTag', () => {
  it('sends a stable version to latest', () => {
    expect(deriveDistTag('1.0.0')).toBe('latest');
    expect(deriveDistTag('2.11.3')).toBe('latest');
  });

  it('sends a prerelease to its own identifier', () => {
    expect(deriveDistTag('1.2.0-placeholder.0')).toBe('placeholder');
    expect(deriveDistTag('2.0.0-rc.1')).toBe('rc');
    expect(deriveDistTag('3.0.0-beta')).toBe('beta');
  });

  it('reads past build metadata, which names no channel', () => {
    expect(deriveDistTag('1.0.0+20260903')).toBe('latest');
    expect(deriveDistTag('1.0.0-next.2+20260903')).toBe('next');
  });

  it('refuses a prerelease whose identifier is purely numeric', () => {
    expect(deriveDistTag('1.0.0-0')).toBeUndefined();
  });
});

describe('findBlockingDependency', () => {
  it('lets a package through when every dependency landed', () => {
    const outcomes = new Map<string, PublishOutcome>([['types', 'published'], ['func', 'already-live']]);
    expect(findBlockingDependency(['types', 'func'], outcomes)).toBeUndefined();
  });

  it('blocks a package whose dependency failed', () => {
    const outcomes = new Map<string, PublishOutcome>([['types', 'published'], ['collections', 'failed']]);
    expect(findBlockingDependency(['types', 'collections'], outcomes)).toBe('collections');
  });

  it('blocks transitively as the topological walk records each outcome', () => {
    // collections fails, iterable depends on collections, restify depends on iterable: walking in
    // topological order, each blocked package is itself a blocker for the next.
    const outcomes = new Map<string, PublishOutcome>([['collections', 'failed']]);

    const iterableBlocker = findBlockingDependency(['collections'], outcomes);
    expect(iterableBlocker).toBe('collections');
    outcomes.set('iterable', 'blocked');

    expect(findBlockingDependency(['iterable'], outcomes)).toBe('iterable');
  });

  it('ignores a dependency the walk has not reached yet', () => {
    expect(findBlockingDependency(['types'], new Map<string, PublishOutcome>())).toBeUndefined();
  });
});
