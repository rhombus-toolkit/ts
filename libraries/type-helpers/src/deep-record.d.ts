export type DeepRecord<TKey extends PropertyKey = PropertyKey, TValue = any> = {
  [K in TKey]: DeepRecordItem<TKey, TValue>;
};
export type DeepRecordItem<TKey extends PropertyKey = PropertyKey, TValue = any> =
  | TValue
  | DeepRecord<TKey, TValue>;

export type Dictionary<T = any> = Record<string, T>;
export type DeepDictionary<T = any> = DeepRecord<string, T>;
export type DeepDictionaryItem<T = any> = DeepRecordItem<string, T>;


