/**
 * A stack whose entries are removed when their scope ends.
 *
 * @remarks
 * Iterates outermost first.
 */
export class AutoStack<T> implements Iterable<T> {
  readonly #items: T[] = [];

  /** How many entries the stack holds. */
  get length(): number {
    return this.#items.length;
  }

  /** Adds `item`; disposing the return truncates back to the pre-push depth, so an outer scope's dispose also drops what an inner one left. */
  push(item: T): Disposable {
    const pos = this.#items.length;
    this.#items.push(item);
    return { [Symbol.dispose]: () => {
      this.#items.length = pos;
    } };
  }

  /** Whether `item` sits anywhere in the stack, not only at the top. */
  has(item: T): boolean {
    return this.#items.includes(item);
  }

  /** The innermost entry, absent where the stack holds nothing. */
  peek(): T | undefined {
    return this.#items.at(-1);
  }

  [Symbol.iterator](): ArrayIterator<T> {
    return this.#items.values();
  }
}
