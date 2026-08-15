// http://compromise.cool/website/browse/irregular_verbs.html

type map = { arise: 'arose'; babysit: 'babysat'; be: 'was'; is: 'was'; begin: 'began'; bind: 'bound'; bite: 'bit';
  bleed: 'bled'; break: 'broke'; breed: 'bred'; bring: 'brought'; broadcast: 'broadcast'; build: 'built'; buy: 'bought';
  catch: 'caught'; choose: 'chose'; cost: 'cost'; deal: 'dealt'; dig: 'dug'; do: 'did'; draw: 'drew'; drink: 'drank';
  drive: 'drove'; eat: 'ate'; fall: 'fell'; feed: 'fed'; feel: 'felt'; fight: 'fought'; find: 'found'; fly: 'flew';
  forbid: 'forbade'; forget: 'forgot'; forgive: 'forgave'; freeze: 'froze'; get: 'got'; give: 'gave'; go: 'went';
  hang: 'hung'; have: 'had'; hear: 'heard'; hide: 'hid'; hold: 'held'; hurt: 'hurt'; lay: 'laid'; lead: 'led';
  leave: 'left'; lie: 'lied'; light: 'lit'; lose: 'lost'; make: 'made'; mean: 'meant'; meet: 'met'; pay: 'paid';
  read: 'read'; ring: 'rang'; rise: 'rose'; run: 'ran'; say: 'said'; see: 'saw'; sell: 'sold'; shine: 'shone';
  shoot: 'shot'; show: 'showed'; sing: 'sang'; sink: 'sank'; sit: 'sat'; slide: 'slid'; speak: 'spoke'; spin: 'spun';
  spread: 'spread'; stand: 'stood'; steal: 'stole'; stick: 'stuck'; sting: 'stung'; strike: 'struck'; swear: 'swore';
  swim: 'swam'; swing: 'swung'; teach: 'taught'; tear: 'tore'; tell: 'told'; think: 'thought'; understand: 'understood';
  wake: 'woke'; wear: 'wore'; win: 'won'; withdraw: 'withdrew'; write: 'wrote'; tie: 'tied'; ski: 'skiied';
  compete: 'competed'; being: 'were'; imply: 'implied'; ice: 'iced'; develop: 'develop'; wait: 'waited'; spill: 'spilt';
  drop: 'dropped'; log: 'logged'; rub: 'rubbed'; suit: 'suited'; };

// Upstream builds its reverse lookup with a reducer (`h[value] = key`), so when
// two infinitives share a past-tense form the LAST key written wins — a single
// string, not a union. A naive `{[K in keyof T as T[K]]: K}` instead UNIONS the
// colliding keys, which would make `ToInfinitive<'was'>` resolve to `'be' | 'is'`
// rather than upstream's `'is'`. `'was'` (from both `be` and `is`) is the only
// duplicate-value collision in `map`, and `is` is written after `be`, so we pin
// the last-wins result explicitly via the trailing intersection member.
type Invert<T extends Record<PropertyKey, PropertyKey>> = { [K in keyof T as T[K]]: K; } & { was: 'is'; };

export type FromInfinitive<T> = T extends keyof map ? map[T] : never;
export type ToInfinitive<T> = T extends keyof Invert<map> ? Invert<map>[T] : undefined;
