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

  validate(bencodedValue: string): boolean {
    return (
      bencodedValue[0] === "d" &&
      bencodedValue[bencodedValue.length - 1] === "e"
    );
  }

  decode(bencodedValue: string): unknown {
    if (!this.validate(bencodedValue)) {
      throw new Error(
        "Invalid dictionary encoding format. Dictionary encoded values should start with 'd' followed by the key value pairs and ending with 'e'",
        { cause: bencodedValue }
      );
    }

    return this.recurse(bencodedValue.slice(1, bencodedValue.length - 1));
  }

  recurse(bencodedValue: string): Record<string, unknown> {
    if (bencodedValue === "") {
      return {};
    }

    const result: Record<string, unknown> = {};

    const [encodedKey, rest] = this.keyDecoder.takeNext(bencodedValue);

    const valueDecoder = this.valueDecoders.find((dec) => dec.match(rest));

    if (!valueDecoder) {
      throw new Error("Unsupported value format", { cause: rest });
    }

    const [encodedValue, remaining] = valueDecoder.takeNext(rest);

    result[this.keyDecoder.decode(encodedKey)] =
      valueDecoder.decode(encodedValue);

    if (remaining) {
      Object.assign(result, this.recurse(remaining));
    }

    return result;
  }
}
