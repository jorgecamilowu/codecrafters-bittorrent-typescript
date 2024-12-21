export interface Decoder {
  match(benecodedValue: string): boolean;
  takeNext(beencodedValue: string): [string, string];
  decode(benecodedValue: string): unknown;
}
