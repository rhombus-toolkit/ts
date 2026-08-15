import { IsUncountable } from './uncountables';

// Type-level assertions for the uncountable rules, generated from the verified
// dataset (oracle = blakeembrey/pluralize v8.0.0 checkWord semantics; resolved
// types read back via the tsc sentinel-assignment probe — 143 cases, 0
// divergences from the oracle, modulo the accepted lowercase fold).
//
// This file is `.test-d.ts`, the repo's type-level test convention: the
// package's tsconfig.ci.json includes it in the type-check program run by
// `bun run lint`, so a deliberately-wrong assertion or an unsatisfied
// `@ts-expect-error` below fails the build. (Formerly gated only by a
// scripted oracle-vs-tsc probe, back when this lived under heft as a
// `.d.test.ts` file parsed as an inert ambient declaration.)

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// --- Exact-word union: every upstream string entry resolves IsUncountable=true. ---
namespace word_adulthood {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'adulthood'>, true>;
}
namespace word_advice {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'advice'>, true>;
}
namespace word_agenda {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'agenda'>, true>;
}
namespace word_aid {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'aid'>, true>;
}
namespace word_aircraft {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'aircraft'>, true>;
}
namespace word_alcohol {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'alcohol'>, true>;
}
namespace word_ammo {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'ammo'>, true>;
}
namespace word_analytics {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'analytics'>, true>;
}
namespace word_anime {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'anime'>, true>;
}
namespace word_athletics {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'athletics'>, true>;
}
namespace word_audio {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'audio'>, true>;
}
namespace word_bison {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'bison'>, true>;
}
namespace word_blood {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'blood'>, true>;
}
namespace word_bream {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'bream'>, true>;
}
namespace word_buffalo {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'buffalo'>, true>;
}
namespace word_butter {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'butter'>, true>;
}
namespace word_carp {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'carp'>, true>;
}
namespace word_cash {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'cash'>, true>;
}
namespace word_chassis {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'chassis'>, true>;
}
namespace word_chess {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'chess'>, true>;
}
namespace word_clothing {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'clothing'>, true>;
}
namespace word_cod {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'cod'>, true>;
}
namespace word_commerce {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'commerce'>, true>;
}
namespace word_cooperation {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'cooperation'>, true>;
}
namespace word_corps {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'corps'>, true>;
}
namespace word_debris {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'debris'>, true>;
}
namespace word_diabetes {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'diabetes'>, true>;
}
namespace word_digestion {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'digestion'>, true>;
}
namespace word_elk {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'elk'>, true>;
}
namespace word_energy {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'energy'>, true>;
}
namespace word_equipment {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'equipment'>, true>;
}
namespace word_excretion {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'excretion'>, true>;
}
namespace word_expertise {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'expertise'>, true>;
}
namespace word_firmware {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'firmware'>, true>;
}
namespace word_flounder {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'flounder'>, true>;
}
namespace word_fun {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'fun'>, true>;
}
namespace word_gallows {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'gallows'>, true>;
}
namespace word_garbage {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'garbage'>, true>;
}
namespace word_graffiti {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'graffiti'>, true>;
}
namespace word_hardware {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'hardware'>, true>;
}
namespace word_headquarters {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'headquarters'>, true>;
}
namespace word_health {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'health'>, true>;
}
namespace word_herpes {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'herpes'>, true>;
}
namespace word_highjinks {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'highjinks'>, true>;
}
namespace word_homework {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'homework'>, true>;
}
namespace word_housework {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'housework'>, true>;
}
namespace word_information {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'information'>, true>;
}
namespace word_jeans {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'jeans'>, true>;
}
namespace word_justice {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'justice'>, true>;
}
namespace word_kudos {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'kudos'>, true>;
}
namespace word_labour {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'labour'>, true>;
}
namespace word_literature {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'literature'>, true>;
}
namespace word_machinery {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'machinery'>, true>;
}
namespace word_mackerel {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'mackerel'>, true>;
}
namespace word_mail {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'mail'>, true>;
}
namespace word_media {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'media'>, true>;
}
namespace word_mews {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'mews'>, true>;
}
namespace word_moose {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'moose'>, true>;
}
namespace word_music {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'music'>, true>;
}
namespace word_mud {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'mud'>, true>;
}
namespace word_manga {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'manga'>, true>;
}
namespace word_news {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'news'>, true>;
}
namespace word_only {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'only'>, true>;
}
namespace word_personnel {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'personnel'>, true>;
}
namespace word_pike {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pike'>, true>;
}
namespace word_plankton {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'plankton'>, true>;
}
namespace word_pliers {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pliers'>, true>;
}
namespace word_police {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'police'>, true>;
}
namespace word_pollution {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pollution'>, true>;
}
namespace word_premises {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'premises'>, true>;
}
namespace word_rain {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'rain'>, true>;
}
namespace word_research {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'research'>, true>;
}
namespace word_rice {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'rice'>, true>;
}
namespace word_salmon {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'salmon'>, true>;
}
namespace word_scissors {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'scissors'>, true>;
}
namespace word_series {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'series'>, true>;
}
namespace word_sewage {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'sewage'>, true>;
}
namespace word_shambles {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'shambles'>, true>;
}
namespace word_shrimp {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'shrimp'>, true>;
}
namespace word_software {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'software'>, true>;
}
namespace word_species {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'species'>, true>;
}
namespace word_staff {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'staff'>, true>;
}
namespace word_swine {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'swine'>, true>;
}
namespace word_tennis {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'tennis'>, true>;
}
namespace word_traffic {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'traffic'>, true>;
}
namespace word_transportation {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'transportation'>, true>;
}
namespace word_trout {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'trout'>, true>;
}
namespace word_tuna {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'tuna'>, true>;
}
namespace word_wealth {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'wealth'>, true>;
}
namespace word_welfare {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'welfare'>, true>;
}
namespace word_whiting {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'whiting'>, true>;
}
namespace word_wildebeest {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'wildebeest'>, true>;
}
namespace word_wildlife {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'wildlife'>, true>;
}
namespace word_you {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'you'>, true>;
}

// --- Pattern arms: >=2 positives + boundary negatives per regex entry. ---
namespace pattern_pok_e__mon {
  // /pok[eé]mon$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pokemon'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pokémon'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pokeman'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pokmon'>, false>;
}
namespace pattern___aeiou_ese {
  // /[^aeiou]ese$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'chinese'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'japanese'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'manganese'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'cheese'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'geese'>, false>;
}
namespace pattern_deer {
  // /deer$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'deer'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'reindeer'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'beer'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'deed'>, false>;
}
namespace pattern_fish {
  // /fish$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'fish'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'blowfish'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'angelfish'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'dish'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'finish'>, false>;
}
namespace pattern_measles {
  // /measles$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'measles'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'germanmeasles'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'measle'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'measled'>, false>;
}
namespace pattern_o_iu_s {
  // /o[iu]s$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'carnivorous'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'tedious'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'porous'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'ois'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'ous'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'os'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'oas'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'genius'>, false>;
}
namespace pattern_pox {
  // /pox$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pox'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'chickenpox'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'smallpox'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'fox'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'box'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'pix'>, false>;
}
namespace pattern_sheep {
  // /sheep$/i
  // @ts-expect-no-error
  isAssignable<IsUncountable<'sheep'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'jacobsheep'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'sheet'>, false>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'sheeps'>, false>;
}

// --- Case folding: input is lowercased before matching (accepted divergence). ---
namespace caseFolding {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'ADVICE'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'Chinese'>, true>;
  // @ts-expect-no-error
  isAssignable<IsUncountable<'POKEMON'>, true>;
}

// --- Clearly-countable controls: resolve IsUncountable=false. ---
namespace control_duck {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'duck'>, false>;
}
namespace control_dog {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'dog'>, false>;
}
namespace control_cat {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'cat'>, false>;
}
namespace control_house {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'house'>, false>;
}
namespace control_car {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'car'>, false>;
}
namespace control_book {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'book'>, false>;
}
namespace control_tree {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'tree'>, false>;
}
namespace control_apple {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'apple'>, false>;
}
namespace control_computer {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'computer'>, false>;
}
namespace control_door {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'door'>, false>;
}
namespace control_floor {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'floor'>, false>;
}
namespace control_wax {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'wax'>, false>;
}
namespace control_tax {
  // @ts-expect-no-error
  isAssignable<IsUncountable<'tax'>, false>;
}
