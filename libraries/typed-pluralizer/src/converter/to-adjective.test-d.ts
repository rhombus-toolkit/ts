import { ToAdjective } from './to-adjective';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Generated from the verified converter dataset (oracle == type on every case).
// Each assertion's expected literal is the empirically resolved ToAdjective output.
// '' inputs and no-conversion words resolve to `never`; asserted as such.

namespace irregularMap {
  // full irregular-map membership: every key asserted
  // @ts-expect-no-error
  isAssignable<ToAdjective<'idly'>, 'idle'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'sporadically'>, 'sporadic'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'basically'>, 'basic'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'grammatically'>, 'grammatical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'alphabetically'>, 'alphabetical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'economically'>, 'economical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'conically'>, 'conical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'politically'>, 'political'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'vertically'>, 'vertical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'practically'>, 'practical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'theoretically'>, 'theoretical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'critically'>, 'critical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'fantastically'>, 'fantastic'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'mystically'>, 'mystical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'pornographically'>, 'pornographic'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'fully'>, 'full'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'jolly'>, 'jolly'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'wholly'>, 'whole'>;
}

namespace transforms {
  // >=2 positives per transform arm + collisions + boundary fall-through
  // @ts-expect-no-error
  isAssignable<ToAdjective<'nobly'>, 'noble'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'feebly'>, 'feeble'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'humbly'>, 'humble'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'logically'>, 'logical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'magically'>, 'magical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'tragically'>, 'tragical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'historically'>, 'historical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'classically'>, 'classical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'periodically'>, 'periodical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'graphically'>, 'graphical'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'publically'>, 'public'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'specifically'>, 'specific'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'terrifically'>, 'terrific'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'truly'>, 'true'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'unduly'>, 'undue'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'happily'>, 'happy'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'easily'>, 'easy'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'lazily'>, 'lazy'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'quickly'>, 'quick'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'slowly'>, 'slow'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'gladly'>, 'glad'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'bravely'>, 'brave'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'fly'>, 'fly'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'ply'>, 'ply'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'sly'>, 'sly'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'ably'>, 'able'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'rely'>, 'rely'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'sky'>, 'sky'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'cat'>, 'cat'>;
}

namespace caseFolding {
  // input folded through Lowercase<T>; output lowercase
  // @ts-expect-no-error
  isAssignable<ToAdjective<'QUICKLY'>, 'quick'>;
  // @ts-expect-no-error
  isAssignable<ToAdjective<'Idly'>, 'idle'>;
}
