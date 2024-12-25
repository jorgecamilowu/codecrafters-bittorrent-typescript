import { BencodedIterator } from "../values/BencodedIterator";
import type { DictionaryBencoded } from "../values/DictionaryBencoded";
import type { Decoder } from "./Decoder";

export class DictionaryDecoder implements Decoder {
  constructor(private bencoded: DictionaryBencoded) {}

  decode(): Record<string, unknown> {
    const { value } = this.bencoded;
    const body = value.slice(1, value.length - 1);

    if (body === "") {
      return {};
    }

    return this.recurse(body);
  }

  private recurse(bencodedValue: string): Record<string, unknown> {
    const decodedValues: Record<string, unknown> = {};

    const iter = new BencodedIterator(bencodedValue);

    const encodedKey = iter.next();
    const encodedValue = iter.next();

    if (!encodedKey || !encodedValue) {
      return decodedValues;
    }

    decodedValues[encodedKey.decoder.decode() as string] =
      encodedValue.decoder.decode();

    const rest = iter.rest();

    if (rest) {
      Object.assign(decodedValues, this.recurse(rest));
    }

    return decodedValues;
  }
}
