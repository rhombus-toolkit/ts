// The decisions publish-libraries.ts makes without talking to npm.

import { describe, expect, it } from 'bun:test';

import { deriveDistTag } from './publish-libraries';

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
