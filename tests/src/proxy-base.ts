import { IndexAccessed, ProxyBase } from '@rhombus-toolkit/proxy-base';

class Fallback extends ProxyBase {
  realMethod(): string {
    return 'real';
  }

  protected override _get(property: PropertyKey, _receiver: unknown): unknown {
    return `missing:${String(property)}`;
  }

  protected override _set(_property: PropertyKey, _value: unknown, _receiver: unknown): boolean {
    return true;
  }

  protected override _has(_property: PropertyKey): boolean {
    return false;
  }
}

const f = new Fallback();

const a: boolean = f instanceof Fallback;
const b: boolean = f instanceof ProxyBase;

const m: string = f.realMethod();

class Env extends IndexAccessed<string> {
  readonly #store = new Map<PropertyKey, string>();

  protected _getIndex(key: PropertyKey): string {
    return this.#store.get(key) ?? (undefined as unknown as string);
  }

  protected _setIndex(key: PropertyKey, value: string): string {
    this.#store.set(key, value);
    return value;
  }
}

const env = new Env();

const indexable = env as unknown as Record<PropertyKey, string>;
indexable['SOMEKEY'] = 'value';
const read: string = indexable['SOMEKEY'];

const isEnv: boolean = env instanceof Env;
const isIndexAccessed: boolean = env instanceof IndexAccessed;

// Narrowed-Key exercise using the members-interface Exclude pattern: real
// member names are subtracted from the indexed Key union.
type NarrowedKeys = 'PATH' | 'HOME' | 'refresh';
interface NarrowedApi {
  refresh(): void;
}

class NarrowedEnv extends IndexAccessed<string, Exclude<NarrowedKeys, keyof NarrowedApi>> implements NarrowedApi {
  readonly #store = new Map<PropertyKey, string>();

  refresh(): void {
    this.#store.clear();
  }

  protected _getIndex(key: 'PATH' | 'HOME'): string {
    return this.#store.get(key) ?? (undefined as unknown as string);
  }

  protected _setIndex(key: 'PATH' | 'HOME', value: string): string {
    this.#store.set(key, value);
    return value;
  }
}

const narrowed = new NarrowedEnv();
const narrowedAccess = narrowed as unknown as Record<'PATH' | 'HOME', string>;
narrowedAccess['PATH'] = '/usr/bin';
const narrowedRead: string = narrowedAccess['HOME'];
narrowed.refresh();

const isNarrowed: boolean = narrowed instanceof NarrowedEnv;
