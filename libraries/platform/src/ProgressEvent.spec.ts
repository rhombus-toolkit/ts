import { describe, expect, it } from 'bun:test';
import { ProgressEvent } from './ProgressEvent';

describe('ProgressEvent', () => {
  it('constructs an Event carrying the progress fields', () => {
    const event = new ProgressEvent('progress', { lengthComputable: true, loaded: 3, total: 9 });

    expect(event).toBeInstanceOf(globalThis.Event);
    expect(event.type).toBe('progress');
    expect(event.lengthComputable).toBe(true);
    expect(event.loaded).toBe(3);
    expect(event.total).toBe(9);
  });

  it('defaults every progress field when given none', () => {
    const event = new ProgressEvent('progress');

    expect(event.lengthComputable).toBe(false);
    expect(event.loaded).toBe(0);
    expect(event.total).toBe(0);
  });

  it('dispatches through an EventTarget', () => {
    const target = new EventTarget();
    const seen: number[] = [];
    target.addEventListener('progress', (event) => seen.push((event as ProgressEvent).loaded));

    target.dispatchEvent(new ProgressEvent('progress', { loaded: 5 }));

    expect(seen).toEqual([5]);
  });
});
