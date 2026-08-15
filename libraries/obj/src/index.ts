export * from './flattenMap';
// Namespaced rather than flattened into this barrel: `obj.keys` is the point --
// each member is a type and a same-named wrapper function declaration-merged
// together, and the namespace is what keeps `obj.keys(x)` and `obj.keys<T>`
// spelled the same way they were when this lived in type-helpers.
export * as obj from './obj';
