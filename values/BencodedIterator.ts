import type { Bencoded } from "./Bencoded";
import { IntegerBencoded } from "./IntegerBencoded";
import { StringBencoded } from "./StringBencoded";

export class BencodedIterator {
  private position = 0;
  constructor(private rawBencoded: string) {}

  next(): Bencoded {
    const bencoded = this.makeBencoded();

    this.position += bencoded.value.length;

    return bencoded;
  }

  private makeBencoded(): Bencoded {
    const ref = this.rawBencoded.slice(this.position);

    if (ref === "") {
      return {
        value: "",
      };
    }

    if (StringBencoded.match(ref)) {
      return new StringBencoded(ref);
    }

    if (IntegerBencoded.match(ref)) {
      return new IntegerBencoded(ref);
    }

    throw new Error("Attempt to iterate on unsupported format!");
  }
}
