export interface Decoder {
  match(bencodedValue: string): boolean;
  takeNext(bencodedValue: string): [string, string];
  decode(bencodedValue: string): unknown;
}
