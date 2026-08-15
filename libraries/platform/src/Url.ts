// Owned `URL`/`Url` typing (like ./abort.ts): a typed `globalThis` lookup so
// `@rhombus-toolkit/type-guards`'s parked `isUrl` can name a `URL`-shaped
// value without pulling all of lib.dom in for one identifier. `searchParams`
// is left loose (`any`) -- `URLSearchParams`'s shape diverges across
// lib.dom/@types/node/bun-types, and naming it would drag in the second lib
// type this whole pattern exists to avoid.

import { Ctor } from '@rhombus-toolkit/types';

/** Structural counterpart of the platform `URL`. */
export interface Url {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  username: string;
  readonly searchParams: any; // loose: URLSearchParams diverges across variants
  toString(): string;
  toJSON(): string;
}

/** Constructor shape for {@link Url}, matching the platform global's static side. */
export type UrlConstructor = Ctor<[url: string, base?: string], Url>;

/** The platform `URL` constructor, re-typed against the owned structural interface. */
export const URL: UrlConstructor = (globalThis as unknown as { URL: UrlConstructor; }).URL;
