import { assertNever, isIterable, isIterator } from '@rhombus-toolkit/type-guards';

/** Replays a one-shot source: each element is pulled once, on first demand, and kept for every later walk. */
class SafeIterable<T> implements Iterable<T> {
  /** The source until it reports done, then dropped so whatever it held can be collected. */
  #source: Iterator<T> | undefined;
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

  [Symbol.iterator](): IterableIterator<T> {
    if (this.#source === undefined) {
      return this.#cache[Symbol.iterator]();
    }
    return this.#pullThrough();
  }

  /** Walks the cache, pulling from the source whenever the cache runs out ahead of the walk. */
  *#pullThrough(): Generator<T> {
    let pos = 0;
    while (true) {
      while (pos < this.#cache.length) {
        yield this.#cache[pos++];
      }
      if (this.#source === undefined) {
        return;
      }
      const { done, value } = this.#source.next();
      if (done) {
        this.#source = undefined;
        return;
      }
      this.#cache.push(value);
    }
  }
}

/**
 * Protection from one-shot iterators: wraps a source that spends itself on its first walk so it can be walked
 * any number of times. Elements are read lazily and at most once; walks in flight at the same time share that
 * single pass.
 */
export function repeatable<T>(source: Iterator<T>): Iterable<T>;
export function repeatable<T>(source: Iterable<T>): Iterable<T>;
export function repeatable<T>(source: Iterator<T> | Iterable<T>): Iterable<T> {
  return source instanceof SafeIterable ? source : new SafeIterable(source);
}
