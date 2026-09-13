// Behavior tests for ImmutableLinkedList -- persistence is the load-bearing part: a list handed out stays
// exactly what it was however much is added or removed afterwards, and both ends are known without
// walking for either.

import { describe, expect, test } from 'bun:test';
import { ImmutableLinkedList } from './ImmutableLinkedList';

/** `values` as a list, the first of them ending up at the tail. */
function listOf<T>(...values: readonly T[]) {
  return values.reduce<ImmutableLinkedList<T>>((list, value) => list.push(value), ImmutableLinkedList.empty<T>());
}

describe('ImmutableLinkedList', () => {
  test('an empty list holds nothing at either end', () => {
    expect(ImmutableLinkedList.empty().size).toBe(0);
    expect(ImmutableLinkedList.empty().head).toBeUndefined();
    expect(ImmutableLinkedList.empty().tail).toBeUndefined();
    expect([...ImmutableLinkedList.empty()]).toEqual([]);
  });

  test('pushes onto the empty list with nothing to infer from but the value', () => {
    const list = ImmutableLinkedList.empty<number>().push(33);

    expect(list.head).toBe(33);
    expect(list.size).toBe(1);
  });

  test('adding puts the value at the head and leaves the tail where it was', () => {
    const list = listOf('oldest', 'middle', 'newest');

    expect(list.size).toBe(3);
    expect(list.head).toBe('newest');
    expect(list.tail).toBe('oldest');
  });

  test('adding leaves the list added to untouched', () => {
    const before = listOf('a', 'b');
    const after = before.push('c');

    expect([...before]).toEqual(['b', 'a']);
    expect([...after]).toEqual(['c', 'b', 'a']);
    expect(before.size).toBe(2);
  });

  test('reads from the head, and from the tail on request', () => {
    const list = listOf('oldest', 'middle', 'newest');

    expect([...list]).toEqual(['newest', 'middle', 'oldest']);
    expect(list.tailToHead()).toEqual(['oldest', 'middle', 'newest']);
  });

  test('the tail-to-head order is settled once and returned from then on', () => {
    const list = listOf('a', 'b');

    expect(list.tailToHead()).toBe(list.tailToHead());
  });

  test('removing returns the list itself when nothing matches', () => {
    const list = listOf('a', 'b');

    expect(list.remove(value => value === 'absent')).toBe(list);
  });

  test('removing drops the first match and leaves the list removed from untouched', () => {
    const before = listOf('a', 'b', 'c');
    const after = before.remove(value => value === 'b');

    expect([...after]).toEqual(['c', 'a']);
    expect(after.size).toBe(2);
    expect([...before]).toEqual(['c', 'b', 'a']);
  });

  test('removing what stood at an end moves that end', () => {
    const list = listOf('oldest', 'newest');

    expect(list.remove(value => value === 'oldest').tail).toBe('newest');
    expect(list.remove(value => value === 'newest').head).toBe('oldest');
  });

  test('the empty list is the one instance however it is asked for', () => {
    expect(ImmutableLinkedList.empty<number>()).toBe(
      ImmutableLinkedList.empty<string>() as ImmutableLinkedList<unknown>,
    );
  });

  test('a single value stands at both ends', () => {
    const list = ImmutableLinkedList.empty<string>().push('only');

    expect(list.head).toBe('only');
    expect(list.tail).toBe('only');
    expect(list.tailToHead()).toEqual(['only']);
  });

  test('holds undefined as a value, told apart from holding nothing by size', () => {
    const list = ImmutableLinkedList.empty<undefined>().push(undefined);

    expect(list.size).toBe(1);
    expect(list.head).toBeUndefined();
    expect([...list]).toEqual([undefined]);
  });

  test('iterates afresh every time it is read', () => {
    const list = listOf('a', 'b');

    expect([...list]).toEqual([...list]);
    expect(list[Symbol.iterator]()).not.toBe(list[Symbol.iterator]());
  });

  test('the empty list reads as nothing from the tail too', () => {
    expect(ImmutableLinkedList.empty().tailToHead()).toEqual([]);
  });

  test('the settled tail-to-head order is not shared with a list pushed onto afterwards', () => {
    const before = listOf('a', 'b');
    const settled = before.tailToHead();
    const after = before.push('c');

    expect(after.tailToHead()).toEqual(['a', 'b', 'c']);
    expect(before.tailToHead()).toBe(settled);
    expect(settled).toEqual(['a', 'b']);
  });

  test('removing from the empty list returns the empty list', () => {
    const empty = ImmutableLinkedList.empty<string>();

    expect(empty.remove(() => true)).toBe(empty);
  });

  test('removing the only value leaves a list holding nothing', () => {
    const list = ImmutableLinkedList.empty<string>().push('only').remove(() => true);

    expect(list.size).toBe(0);
    expect(list.head).toBeUndefined();
    expect(list.tail).toBeUndefined();
    expect([...list]).toEqual([]);
    expect(list.tailToHead()).toEqual([]);
  });

  test('removing drops only the first match, counted from the head', () => {
    const list = listOf('x', 'y', 'x');

    expect([...list.remove(value => value === 'x')]).toEqual(['y', 'x']);
  });

  test('removing stops asking once something matches', () => {
    const asked: string[] = [];
    const list = listOf('a', 'b', 'c');

    list.remove(value => {
      asked.push(value);
      return value === 'b';
    });

    expect(asked).toEqual(['c', 'b']);
  });

  test('removing asks about every value, head first, when nothing matches', () => {
    const asked: string[] = [];
    const list = listOf('a', 'b', 'c');

    list.remove(value => {
      asked.push(value);
      return false;
    });

    expect(asked).toEqual(['c', 'b', 'a']);
  });

  test('removing reads from the tail correctly afterwards', () => {
    const list = listOf('a', 'b', 'c', 'd');

    expect(list.remove(value => value === 'c').tailToHead()).toEqual(['a', 'b', 'd']);
    expect(list.remove(value => value === 'a').tailToHead()).toEqual(['b', 'c', 'd']);
    expect(list.remove(value => value === 'd').tailToHead()).toEqual(['a', 'b', 'c']);
  });

  test('lists sharing a history stay independent under further changes', () => {
    const base = listOf('a', 'b');
    const left = base.push('c');
    const right = base.push('d').remove(value => value === 'a');

    expect([...base]).toEqual(['b', 'a']);
    expect([...left]).toEqual(['c', 'b', 'a']);
    expect([...right]).toEqual(['d', 'b']);
    expect(left.tail).toBe('a');
    expect(right.tail).toBe('b');
  });
});
