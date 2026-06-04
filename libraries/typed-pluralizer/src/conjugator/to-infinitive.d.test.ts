import { ToInfinitive } from './to-infinitive';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Locks ToInfinitive (past-tense -> infinitive) rule behavior in as type tests.
// Each assertion was resolved empirically via the tsc sentinel-assignment probe
// and cross-checked against a node oracle that replays the comment regexes
// first-match-wins. Outputs are the REGEX-FAITHFUL values: where the rule is
// linguistically wrong (rolled -> rolle, toed -> too, curved -> curve via the
// strip-ed-append-e arm) the assertion pins the regex output, since the per-arm
// comments are the spec, not English. Arm labels group words by matched rule.

// Irregular-verb table is consulted first (unlike FromInfinitive, this branch is
// active): a past-tense form in the table maps straight back to its infinitive.
namespace irregular {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'left'>, 'leave'>;
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'made'>, 'make'>;
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'drew'>, 'draw'>;
}

// (ued) => ue
namespace argued {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'argued'>, 'argue'>;
}
namespace queued {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'queued'>, 'queue'>;
}

// (e|i)lled => $1ll
namespace filled {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'filled'>, 'fill'>;
}
namespace spilled {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'spilled'>, 'spill'>;
}

// (..[^aeiou])ed => $1e  [FIX: strip ed + append e, was dropping the e]
namespace rolled {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'rolled'>, 'rolle'>;
}
namespace controlled {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'controlled'>, 'controlle'>;
}
namespace helped {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'helped'>, 'helpe'>;
}
namespace jumped {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'jumped'>, 'jumpe'>;
}
namespace gulped {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'gulped'>, 'gulpe'>;
}
namespace curved {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'curved'>, 'curve'>;
}
namespace served {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'served'>, 'serve'>;
}
namespace bulged {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'bulged'>, 'bulge'>;
}
namespace judged {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'judged'>, 'judge'>;
}
namespace surfed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'surfed'>, 'surfe'>;
}
namespace scoffed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'scoffed'>, 'scoffe'>;
}

// (sh|ch)ed => $1
namespace washed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'washed'>, 'wash'>;
}
namespace marched {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'marched'>, 'march'>;
}

// (tl|gl)ed => $1e
namespace settled {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'settled'>, 'settle'>;
}
namespace toggled {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'toggled'>, 'toggle'>;
}

// (ss)ed => $1
namespace tossed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'tossed'>, 'toss'>;
}
namespace kissed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'kissed'>, 'kiss'>;
}

// pped => p
namespace stopped {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'stopped'>, 'stop'>;
}
namespace hopped {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'hopped'>, 'hop'>;
}

// tted => t
namespace fitted {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'fitted'>, 'fit'>;
}
namespace batted {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'batted'>, 'bat'>;
}

// gged => g
namespace bagged {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'bagged'>, 'bag'>;
}
namespace tagged {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'tagged'>, 'tag'>;
}

// (h|ion|n[dt]|ai.|...|rm)ed => $1
namespace wanted {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'wanted'>, 'want'>;
}
namespace folded {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'folded'>, 'fold'>;
}
namespace called {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'called'>, 'call'>;
}
namespace mailed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'mailed'>, 'mail'>;
}
namespace looked {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'looked'>, 'look'>;
}
namespace poured {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'poured'>, 'pour'>;
}
namespace started {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'started'>, 'start'>;
}
namespace alarmed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'alarmed'>, 'alarm'>;
}
namespace formed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'formed'>, 'form'>;
}

// ied => y
namespace cried {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'cried'>, 'cry'>;
}
namespace tried {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'tried'>, 'try'>;
}
namespace denied {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'denied'>, 'deny'>;
}

// (.o)ed => $1o
namespace toed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'toed'>, 'too'>;
}
namespace echoed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'echoed'>, 'echoo'>;
}
namespace wooed {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'wooed'>, 'wooo'>;
}

// ([rl])ew => $1ow
namespace crew {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'crew'>, 'crow'>;
}
namespace slew {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'slew'>, 'slow'>;
}
