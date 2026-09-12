import { memo } from './memo';

/**
 * The instance kept for each structurally equal value, so equal values become `===`.
 *
 * @remarks
 * Structure is the prototype plus the own enumerable string-keyed fields, in any order; an
 * object-valued field counts by identity, so intern it first. A function is its own instance.
 * An instance lives as long as its prototype and every object it holds; one built only of
 * primitives lives as long as the module.
 */
export const intern = (() => {
  /** Every value seen, under its prototype and sorted fields; the first seen is the instance kept. */
  const kept = memo((value: object) => value,
    value => [Object.getPrototypeOf(value),
      ...Object.entries(value).sort(([left], [right]) => left < right ? -1 : 1).flat()]);

  return function intern<T extends object>(value: T): T {
    return typeof value === 'function' ? value : kept(value) as T;
  };
})();
