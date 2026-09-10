import { describe, expect, it } from 'bun:test';
import { Event } from './Event';

describe('Event', () => {
  it('is the platform Event', () => {
    expect(Event).toBe(globalThis.Event);
  });

  it('constructs an event of the given type with the given init', () => {
    const event = new Event('ping', { cancelable: true });

    expect(event.type).toBe('ping');
    expect(event.cancelable).toBe(true);
    expect(event.bubbles).toBe(false);
  });

  it('dispatches through an EventTarget', () => {
    const target = new EventTarget();
    const seen: string[] = [];
    target.addEventListener('ping', (event) => seen.push(event.type));

    target.dispatchEvent(new Event('ping'));

    expect(seen).toEqual(['ping']);
  });
});
