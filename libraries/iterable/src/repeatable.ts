import { assertNever, isIterable, isIterator } from '@rhombus-toolkit/type-guards';

/** Replays a one-shot source: each element is pulled once, on first demand, and kept for every later walk. */
class SafeIterable<T> implements Iterable<T> {
  #source: Iterator<T>;
  #cache: T[] = [];

  constructor(source: Iterator<T> | Iterable<T>) {
    if (isIterator(source)) {
      this.#source = source;
    } else if (isIterable(source)) {
      this.#source = source[Symbol.iterator]();
    } else {
      this.#source = assertNever(source);
    }
  }

  *[Symbol.iterator](): Generator<T> {
    let pos = 0;
    while (true) {
      if (pos < this.#cache.length) {
        const replay = this.#cache.slice(pos);
        pos += replay.length;
        yield* replay;
        continue;
      }
      const { done, value } = this.#source.next();
      if (done) {
        break;
      }
      this.#cache.push(value);
      pos += 1;
      yield value;
    }
  }
}

/**
 * Protection from one-shot iterators: wraps a source that spends itself on its first walk — an iterator, a
 * generator, a lazy chain — so it can be walked any number of times. Elements are read lazily and at most
 * once; walks in flight at the same time share that single pass. A result of this function is handed back
 * as is rather than wrapped again.
 */
export function repeatable<T>(source: Iterator<T>): Iterable<T>;
export function repeatable<T>(source: Iterable<T>): Iterable<T>;
export function repeatable<T>(source: Iterator<T> | Iterable<T>): Iterable<T> {
  return source instanceof SafeIterable ? source : new SafeIterable(source);
}
