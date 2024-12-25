import type { Bencoded } from "./Bencoded";
import { DictionaryBencoded } from "./DictionaryBencoded";
import { IntegerBencoded } from "./IntegerBencoded";
import { ListBencoded } from "./ListBencoded";
import { StringBencoded } from "./StringBencoded";

export class BencodedIterator {
  private position = 0;
  constructor(private rawBencoded: string) {}

  next(): Bencoded | undefined {
    const bencoded = this.makeBencoded();

    if (bencoded === undefined) return bencoded;

    this.position += bencoded.value.length;

    return bencoded;
  }

  rest(): string {
    return this.rawBencoded.slice(this.position);
  }

  private makeBencoded(): Bencoded | undefined {
    const ref = this.rawBencoded.slice(this.position);

    if (ref === "") {
      return undefined;
    }

    if (StringBencoded.match(ref)) {
      return new StringBencoded(ref);
    }

    if (IntegerBencoded.match(ref)) {
      return new IntegerBencoded(ref);
    }

    if (ListBencoded.match(ref)) {
      return new ListBencoded(ref);
    }

    if (DictionaryBencoded.match(ref)) {
      return new DictionaryBencoded(ref);
    }

    throw new Error("Attempt to iterate on unsupported format!");
  }
}
