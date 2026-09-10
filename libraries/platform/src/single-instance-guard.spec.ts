import { describe, expect, it } from 'bun:test';
import { stampSingleInstance } from './single-instance-guard';

/** A package name no other test has stamped, so the process-wide slot starts empty. */
function freshPackageName(): string {
  return `@rhombus-toolkit/spec-${Math.random().toString(36).slice(2)}`;
}

describe('stampSingleInstance', () => {
  it("records the first copy under the package's Symbol.for slot", () => {
    const packageName = freshPackageName();

    stampSingleInstance(packageName, 'file:///first/index.js');

    const slot = Symbol.for(`rhombus-toolkit:${packageName}/instance`);
    expect((globalThis as unknown as Record<symbol, unknown>)[slot]).toBe('file:///first/index.js');
  });

  it('is a no-op when the same copy stamps again', () => {
    const packageName = freshPackageName();
    stampSingleInstance(packageName, 'file:///first/index.js');

    expect(() => stampSingleInstance(packageName, 'file:///first/index.js')).not.toThrow();
  });

  it('throws when a different copy stamps, naming the package and both copies', () => {
    const packageName = freshPackageName();
    stampSingleInstance(packageName, 'file:///first/index.js');

    expect(() => stampSingleInstance(packageName, 'file:///second/index.js')).toThrow(
      `Two copies of ${packageName} are loaded in one process: file:///first/index.js (loaded first) and file:///second/index.js`,
    );
  });

  it('keeps the first copy after a rejected second one', () => {
    const packageName = freshPackageName();
    stampSingleInstance(packageName, 'file:///first/index.js');
    expect(() => stampSingleInstance(packageName, 'file:///second/index.js')).toThrow();

    expect(() => stampSingleInstance(packageName, 'file:///first/index.js')).not.toThrow();
    expect(() => stampSingleInstance(packageName, 'file:///second/index.js')).toThrow();
  });

  it('guards each package independently', () => {
    const first = freshPackageName();
    const second = freshPackageName();
    stampSingleInstance(first, 'file:///first/index.js');

    expect(() => stampSingleInstance(second, 'file:///second/index.js')).not.toThrow();
  });
});
