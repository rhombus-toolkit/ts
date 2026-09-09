import 'setimmediate';

const w = globalThis as any;

/**
 * Schedules `callback` to run on the next iteration of the event loop, after all pending microtasks.
 *
 * @returns An ID that `clearImmediate` can cancel.
 */
const si: <T extends unknown[]>(callback: (...args: T) => void, ...args: T) => number = w.setImmediate;

/** Cancels a macrotask scheduled by `setImmediate` before it runs. */
const ci: (handle: number) => void = w.clearImmediate;

try {
  delete w.setImmediate;
  delete w.clearImmediate;
} catch (er) {}

export { ci as clearImmediate, si as setImmediate };
export default si;
