export * from './flattenMap';
// `obj` is declared as a real `export namespace obj` in ./obj rather than a
// barrel `export * as obj from './obj'`: the barrel form makes rollup-plugin-dts
// synthesize the namespace at bundle time, in the process dropping the type
// half of each declaration-merged type+function pair (see ./obj header).
export { obj } from './obj';
