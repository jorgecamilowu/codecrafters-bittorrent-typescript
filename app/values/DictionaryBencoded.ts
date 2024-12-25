import type { Bencoded } from "./Bencoded";
import { BencodedIterator } from "./BencodedIterator";
import { DictionaryDecoder } from "../decoders/DictionaryDecoder";

export class DictionaryBencoded implements Bencoded {
  constructor(private bencodedValue: string) {
    if (!this.validate()) {
      throw new Error("Invalid dictionary bencoded format!");
    }
  }
  static match(bencodedValue: string): boolean {
    return bencodedValue[0] === "d";
  }

  private validate(): boolean {
    return DictionaryBencoded.match(this.bencodedValue);
  }

  get value() {
    const withoutPrefix = this.bencodedValue.slice(1);

    let offset = 0;

    while (offset < this.bencodedValue.length) {
      if (withoutPrefix[offset] === "e") {
        break;
      }

      const offseted = withoutPrefix.slice(offset);

      const iterator = new BencodedIterator(offseted);

      const next = iterator.next();

      if (next === undefined) {
        break;
      }

      offset += next.value.length;
    }

    return this.bencodedValue.slice(0, offset + 2);
  }

  get decoder() {
    return new DictionaryDecoder(this);
  }
}
