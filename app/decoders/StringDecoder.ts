import type { Decoder } from "./Decoder";

export class StringDecoder implements Decoder {
  match(bencoded: string): boolean {
    return !isNaN(parseInt(bencoded[0]));
  }

  takeNext(bencodedValue: string): [string, string] {
    const length = parseInt(bencodedValue[0]);

    return [
      bencodedValue.slice(0, 2 + length),
      bencodedValue.slice(2 + length),
    ];
  }

  private validate(bencodedValue: string) {
    return bencodedValue.length >= 2 && bencodedValue[1] === ":";
  }

  decode(bencodedValue: string): string {
    if (!this.validate(bencodedValue)) {
      throw new Error(
        "Invalid string encoding format. String encoded values should start with the length followed by a ':' and then the string",
        {
          cause: {
            bencodedValue,
          },
        }
      );
    }

    return bencodedValue.slice(2);
  }
}
