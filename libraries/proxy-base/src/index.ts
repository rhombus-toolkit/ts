/**
 * Directly-extendable Proxy: a base class that attaches a per-instance Proxy
 * as its prototype, with protected overridable methods for each proxy hook.
 * See {@link ProxyBase} for the full hook surface and {@link IndexAccessed} for
 * the narrower indexer-only variant.
 *
 * @packageDocumentation
 */

export { IndexAccessed } from './IndexAccessed';
export { default, ProxyBase } from './ProxyBase';
