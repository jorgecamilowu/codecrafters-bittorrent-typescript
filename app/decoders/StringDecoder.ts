import type { Decoder } from "./Decoder";

export class StringDecoder implements Decoder {
  match(bencoded: string): boolean {
    return !isNaN(parseInt(bencoded[0]));
  }

  takeNext(bencodedValue: string): [string, string] {
    const colonPosition = bencodedValue.indexOf(":");

    const length = parseInt(bencodedValue.slice(0, colonPosition));

    return [
      bencodedValue.slice(0, length + colonPosition + 1),
      bencodedValue.slice(length + colonPosition + 1),
    ];
  }

  private validate(bencodedValue: string) {
    return bencodedValue.indexOf(":") !== -1;
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

    return bencodedValue.slice(bencodedValue.indexOf(":") + 1);
  }
}
