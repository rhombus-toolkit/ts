class RepeatableIterable<T> implements Iterable<T> {
  #source: Iterator<T> | undefined;
  #cache: T[] = [];

  constructor(source: Iterator<T> | Iterable<T>) {
    this.#source = Iterator.from(source);
  }

  [Symbol.iterator](): IterableIterator<T> {
    if (this.#source === undefined) {
      return this.#cache[Symbol.iterator]();
    }
    return this.#iterate();
  }

  *#iterate() {
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
 * Wraps a one-shot iterator/iterable so it can be iterated any number of times.
 *
 * @remarks
 * Elements are read lazily and at most once.
 */
export function repeatable<T>(source: Iterator<T> | Iterable<T>): Iterable<T> {
  return source instanceof RepeatableIterable ? source : new RepeatableIterable<T>(source);
}
