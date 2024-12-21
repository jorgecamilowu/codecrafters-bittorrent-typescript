import type { Decoder } from "./Decoder";

export class ListDecoder implements Decoder {
  decodedValues: unknown[] = [];

  constructor(private readonly decoders: Decoder[]) {}
  match(benecodedValue: string): boolean {
    return benecodedValue[0] === "l";
  }

  takeNext(bencoded: string): [string, string] {
    return [bencoded, ""];
  }

  validate(bencodedValue: string): boolean {
    return (
      bencodedValue.length >= 2 &&
      bencodedValue[0] === "l" &&
      bencodedValue[bencodedValue.length - 1] === "e"
    );
  }

  decode(benecodedValue: string): unknown {
    if (!this.validate(benecodedValue)) {
      throw new Error(
        "Invalid list format. Must start with 'l' and end with 'e'"
      );
    }

    this.decodeNext(benecodedValue.slice(1, benecodedValue.length - 1));

    return this.decodedValues;
  }

  decodeNext(bencodedValue: string) {
    const decoder = this.decoders.find((decoder) =>
      decoder.match(bencodedValue)
    );

    if (!decoder) {
      throw new Error("Unsupported encoding format", {
        cause: {
          bencodedValue,
        },
      });
    }

    const [current, rest] = decoder.takeNext(bencodedValue);

    const currentDecoded = decoder.decode(current);

    this.decodedValues.push(currentDecoded);

    if (rest) {
      this.decodeNext(rest);
    }
  }
}
