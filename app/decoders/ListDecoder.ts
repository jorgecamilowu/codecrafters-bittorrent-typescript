import type { Decoder } from "./Decoder";
import { IntegerDecoder } from "./IntegerDecoder";
import { StringDecoder } from "./StringDecoder";

export class ListDecoder implements Decoder {
  private decoders: Decoder[];

  constructor() {
    this.decoders = [new StringDecoder(), new IntegerDecoder(), this];
  }

  match(benecodedValue: string): boolean {
    return benecodedValue[0] === "l";
  }

  takeNext(bencoded: string): [string, string] {
    const withoutL = bencoded.slice(1);

    let offset = 0;

    while (offset < bencoded.length) {
      if (withoutL[offset] === "e") {
        break;
      }

      const offseted = withoutL.slice(offset);

      const decoder = this.decoders.find((dec) => dec.match(offseted));

      if (decoder) {
        const [next] = decoder.takeNext(offseted);
        offset += next.length;
      }
    }

    return [bencoded.slice(0, offset + 2), bencoded.slice(offset + 2)];
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

    return this.decodeNext(benecodedValue.slice(1, benecodedValue.length - 1));
  }

  decodeNext(bencodedValue: string): unknown[] {
    if (bencodedValue === "") {
      return [];
    }

    const decodedValues = [];

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

    const [next, rest] = decoder.takeNext(bencodedValue);

    const currentDecoded = decoder.decode(next);

    decodedValues.push(currentDecoded);

    if (rest) {
      decodedValues.push(...this.decodeNext(rest));
    }

    return decodedValues;
  }
}
