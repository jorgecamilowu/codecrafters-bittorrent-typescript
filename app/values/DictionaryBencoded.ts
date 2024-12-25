import type { Bencoded } from "./Bencoded";
import { BencodedIterator } from "./BencodedIterator";

export class DictionaryBencoded implements Bencoded {
  constructor(private bencodedValue: string) {}

  static match(bencodedValue: string): boolean {
    return bencodedValue[0] === "d";
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

      const next = iterator.next().value;
      offset += next.length;
    }

    return this.bencodedValue.slice(0, offset + 2);
  }
}
