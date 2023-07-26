

export type TypesError<Kind extends ErrorKind, Source extends PropertyKey, Params extends readonly any[], Message extends string | never = never> = {
  type: Kind;
  source: Source;
  params: Params;
  message?: `Ruh Roh! ${Message}\n\nLoser.`;

};
type ErrorKind = 'INVALID_TYPE_ARG' | 'NEVER_CONDITION';
export type InvalidTypeArgError<Source extends PropertyKey, Params extends readonly any[] | never = never, Message extends string | never = never> = TypesError<'INVALID_TYPE_ARG', Source, Params, Message>;
export type AssertNeverError<Source extends PropertyKey, Params extends readonly any[] | never = never, Message extends string | never = never> = TypesError<'NEVER_CONDITION', Source, Params, Message>;

