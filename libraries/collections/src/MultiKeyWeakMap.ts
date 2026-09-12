import type { Func } from '@rhombus-toolkit/types';
import { KindaWeakMap } from './KindaWeakMap';

/** Where a tuple ends: the entry stored there, and the node each further key leads to. */
class Node<Value> {
  readonly next = new KindaWeakMap<unknown, Node<Value>>();

  /** Boxed, so a stored `undefined` is an entry rather than an absence. */
  entry: { value: Value; } | undefined;
}

/**
 * A `KindaWeakMap` keyed by a tuple, matched key by key rather than by the tuple's identity.
 *
 * @remarks
 * Tuples of every length share one map, the empty tuple included. An entry goes when any weakly
 * held key in its tuple is collected; a tuple of primitives lives as long as the map.
 */
export class MultiKeyWeakMap<in out Keys extends readonly unknown[] = unknown[], in out Value = unknown>
  implements WeakMap<Keys, Value>
{
  readonly #root = new Node<Value>();

  get [Symbol.toStringTag](): string {
    return 'MultiKeyWeakMap';
  }

  #findNodeAt(keys: Keys): Node<Value> | undefined {
    return keys.reduce<Node<Value> | undefined>((node, key) => node?.next.get(key), this.#root);
  }

  #ensureNodeAt(keys: Keys): Node<Value> {
    return keys.reduce<Node<Value>>((node, key) => node.next.getOrInsertComputed(key, () => new Node()), this.#root);
  }

  get(keys: Keys): Value | undefined {
    return this.#findNodeAt(keys)?.entry?.value;
  }

  has(keys: Keys): boolean {
    return this.#findNodeAt(keys)?.entry !== undefined;
  }

  set(keys: Keys, value: Value): this {
    this.#ensureNodeAt(keys).entry = { value };
    return this;
  }

  /** Longer tuples through `keys` keep their entries. */
  delete(keys: Keys): boolean {
    const node = this.#findNodeAt(keys);
    if (node?.entry === undefined) {
      return false;
    }
    node.entry = undefined;
    return true;
  }

  /** The entry at `keys`, storing `value` there first when there is none. */
  getOrInsert(keys: Keys, value: Value): Value {
    return (this.#ensureNodeAt(keys).entry ??= { value }).value;
  }

  /** The entry at `keys`, storing what `compute` answers there first when there is none. A throw stores nothing. */
  getOrInsertComputed(keys: Keys, compute: Func<[Keys], Value>): Value {
    return (this.#ensureNodeAt(keys).entry ??= { value: compute(keys) }).value;
  }
}
