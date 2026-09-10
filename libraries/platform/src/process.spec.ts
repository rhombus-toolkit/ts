import { describe, expect, it } from 'bun:test';
import { process } from './process';

describe('process', () => {
  it('is the platform process', () => {
    expect(process).toBe(globalThis.process);
  });

  it('exposes the environment as a string map', () => {
    expect(process.env.PATH).toBe(globalThis.process.env.PATH);
    expect(process.env.RHOMBUS_TOOLKIT_UNSET_VARIABLE).toBeUndefined();
  });

  it('reports the working directory', () => {
    expect(process.cwd()).toBe(globalThis.process.cwd());
  });

  it('registers and removes an event listener', () => {
    let calls = 0;
    const listener = () => calls++;

    process.on('rhombus-toolkit:probe', listener);
    globalThis.process.emit('rhombus-toolkit:probe');
    process.off('rhombus-toolkit:probe', listener);
    globalThis.process.emit('rhombus-toolkit:probe');

    expect(calls).toBe(1);
  });
});
