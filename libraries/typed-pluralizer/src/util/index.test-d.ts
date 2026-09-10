import { AnyOf, Consonant, ExtractEnding, LastChar, Letter, NoneOf, Not, Replace, ReplaceEnding, Vowel } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** The lowercase ASCII alphabet, split into its two disjoint classes. */
namespace letterClassesTest {
  // @ts-expect-no-error
  isAssignable<'a' | 'e' | 'i' | 'o' | 'u', Vowel>;
  // @ts-expect-no-error
  isAssignable<Vowel, 'a' | 'e' | 'i' | 'o' | 'u'>;
  // `y` is a consonant here, whatever English says
  // @ts-expect-error
  isAssignable<'y', Vowel>;
  // @ts-expect-no-error
  isAssignable<'y' | 'b' | 'z', Consonant>;
  // @ts-expect-error
  isAssignable<'a', Consonant>;

  // @ts-expect-no-error
  isAssignable<Letter, Vowel | Consonant>;
  // @ts-expect-no-error
  isAssignable<Vowel | Consonant, Letter>;
  // @ts-expect-no-error
  isAssignable<Vowel & Consonant, never>;

  // lowercase only, letters only
  // @ts-expect-error
  isAssignable<'A', Letter>;
  // @ts-expect-error
  isAssignable<'1', Letter>;
  // @ts-expect-error
  isAssignable<'é', Letter>;
}

/** `Replace` rewrites the first occurrence only. */
namespace replaceTest {
  // @ts-expect-no-error
  isAssignable<Replace<'a-b-c', '-', '+'>, 'a+b-c'>;
  // @ts-expect-no-error
  isAssignable<'a+b-c', Replace<'a-b-c', '-', '+'>>;
  // @ts-expect-error
  isAssignable<Replace<'a-b-c', '-', '+'>, 'a+b+c'>;

  // no match: identity
  // @ts-expect-no-error
  isAssignable<Replace<'abc', 'x', 'y'>, 'abc'>;
  // @ts-expect-no-error
  isAssignable<Replace<'', 'x', 'y'>, ''>;

  // a match at either edge
  // @ts-expect-no-error
  isAssignable<Replace<'xab', 'x', 'y'>, 'yab'>;
  // @ts-expect-no-error
  isAssignable<Replace<'abx', 'x', 'y'>, 'aby'>;
}

/** `ExtractEnding` hands back the ending itself when the word carries it, `never` otherwise. */
namespace extractEndingTest {
  // @ts-expect-no-error
  isAssignable<ExtractEnding<'running', 'ing'>, 'ing'>;
  // @ts-expect-no-error
  isAssignable<'ing', ExtractEnding<'running', 'ing'>>;
  // @ts-expect-no-error
  isAssignable<ExtractEnding<'run', 'ing'>, never>;
  // the whole word is its own ending
  // @ts-expect-no-error
  isAssignable<ExtractEnding<'ing', 'ing'>, 'ing'>;

  // a union of candidate endings: the one the word carries
  // @ts-expect-no-error
  isAssignable<ExtractEnding<'woman', 'man' | 'men'>, 'man'>;
  // @ts-expect-no-error
  isAssignable<'man', ExtractEnding<'woman', 'man' | 'men'>>;
  // @ts-expect-no-error
  isAssignable<ExtractEnding<'women', 'man' | 'men'>, 'men'>;
}

/** `ReplaceEnding` swaps a carried ending and leaves an uncarried one alone. */
namespace replaceEndingTest {
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'running', 'ing', 'er'>, 'runner'>;
  // @ts-expect-no-error
  isAssignable<'runner', ReplaceEnding<'running', 'ing', 'er'>>;
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'run', 'ing', 'er'>, 'run'>;
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'cats', 's', ''>, 'cat'>;

  // the rule files lean on a union of endings collapsing to one rewrite
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'woman', 'man' | 'men', 'men'>, 'women'>;
  // @ts-expect-no-error
  isAssignable<'women', ReplaceEnding<'woman', 'man' | 'men', 'men'>>;
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'women', 'man' | 'men', 'men'>, 'women'>;
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'cactus', 'us' | 'i', 'i'>, 'cacti'>;
  // @ts-expect-no-error
  isAssignable<ReplaceEnding<'cacti', 'us' | 'i', 'i'>, 'cacti'>;
}

/** `AnyOf` spreads a string into the union of its characters. */
namespace anyOfTest {
  // @ts-expect-no-error
  isAssignable<AnyOf<'abc'>, 'a' | 'b' | 'c'>;
  // @ts-expect-no-error
  isAssignable<'a' | 'b' | 'c', AnyOf<'abc'>>;
  // @ts-expect-no-error
  isAssignable<AnyOf<'a'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<AnyOf<'aa'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<AnyOf<''>, never>;
  // @ts-expect-error
  isAssignable<'d', AnyOf<'abc'>>;
}

/** `NoneOf` is the alphabet minus those characters -- only letters can be excluded. */
namespace noneOfTest {
  // @ts-expect-no-error
  isAssignable<NoneOf<'aeiou'>, Consonant>;
  // @ts-expect-no-error
  isAssignable<Consonant, NoneOf<'aeiou'>>;
  // @ts-expect-error
  isAssignable<'a', NoneOf<'a'>>;
  // @ts-expect-no-error
  isAssignable<'b', NoneOf<'a'>>;

  // nothing excluded is the whole alphabet
  // @ts-expect-no-error
  isAssignable<NoneOf<''>, Letter>;
  // @ts-expect-no-error
  isAssignable<Letter, NoneOf<''>>;
  // a non-letter excludes nothing, since it was never in the domain
  // @ts-expect-no-error
  isAssignable<Letter, NoneOf<'1'>>;
  // and the result never reaches outside the alphabet
  // @ts-expect-error
  isAssignable<'1', NoneOf<'a'>>;
}

/** `Not` removes the members of `T` that `U` accepts. */
namespace notTest {
  // @ts-expect-no-error
  isAssignable<Not<'a' | 'b', 'a'>, 'b'>;
  // @ts-expect-no-error
  isAssignable<'b', Not<'a' | 'b', 'a'>>;
  // @ts-expect-no-error
  isAssignable<Not<'a', 'a'>, never>;
  // @ts-expect-no-error
  isAssignable<Not<'a', 'b'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<Not<Letter, Vowel>, Consonant>;
  // @ts-expect-no-error
  isAssignable<Consonant, Not<Letter, Vowel>>;

  // strings only
  // @ts-expect-error
  type NotAString = Not<1, 1>;
}

/** `LastChar` is the final character; the empty string has none. */
namespace lastCharTest {
  // @ts-expect-no-error
  isAssignable<LastChar<'abc'>, 'c'>;
  // @ts-expect-no-error
  isAssignable<'c', LastChar<'abc'>>;
  // @ts-expect-error
  isAssignable<LastChar<'abc'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<LastChar<'a'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<LastChar<''>, never>;

  // distributes over a union
  // @ts-expect-no-error
  isAssignable<LastChar<'ab' | 'cd'>, 'b' | 'd'>;
  // @ts-expect-no-error
  isAssignable<'b' | 'd', LastChar<'ab' | 'cd'>>;

  // any character, not only letters
  // @ts-expect-no-error
  isAssignable<LastChar<'cat5'>, '5'>;
  // @ts-expect-no-error
  isAssignable<LastChar<'café'>, 'é'>;
}
