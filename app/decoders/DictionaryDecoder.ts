import type { Decoder } from "./Decoder";
import { IntegerDecoder } from "./IntegerDecoder";
import { ListDecoder } from "./ListDecoder";
import { StringDecoder } from "./StringDecoder";

export class DictionaryDecoder implements Decoder {
  private keyDecoder: StringDecoder;
  private valueDecoders: Decoder[];

  constructor() {
    this.keyDecoder = new StringDecoder();
    this.valueDecoders = [
      new IntegerDecoder(),
      new StringDecoder(),
      new ListDecoder(),
      this,
    ];
  }

  match(bencodedValue: string): boolean {
    return bencodedValue[0] === "d";
  }
  takeNext(bencodedValue: string): [string, string] {
    const withoutPrefix = bencodedValue.slice(1);
    let offset = 0;

    while (offset < bencodedValue.length) {
      if (withoutPrefix[offset] === "e") {
        break;
      }

      const offseted = withoutPrefix.slice(offset);

      const decoder = this.valueDecoders.find((dec) => dec.match(offseted));

      if (decoder) {
        const [next] = decoder.takeNext(offseted);
        offset += next.length;
      }
    }

    return [
      bencodedValue.slice(0, offset + 2),
      bencodedValue.slice(offset + 2),
    ];
  }
  decode(bencodedValue: string): unknown {
    throw new Error("Method not implemented.");
  }
}
