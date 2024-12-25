import type { Bencoded } from "./Bencoded";
import { DictionaryBencoded } from "./DictionaryBencoded";
import { IntegerBencoded } from "./IntegerBencoded";
import { ListBencoded } from "./ListBencoded";
import { StringBencoded } from "./StringBencoded";

export function toBenecoded(bencoded: string) {
  if (StringBencoded.match(bencoded)) {
    return new StringBencoded(bencoded);
  }

  if (IntegerBencoded.match(bencoded)) {
    return new IntegerBencoded(bencoded);
  }

  if (ListBencoded.match(bencoded)) {
    return new ListBencoded(bencoded);
  }

  if (DictionaryBencoded.match(bencoded)) {
    return new DictionaryBencoded(bencoded);
  }

  throw new Error("Attempt to iterate on unsupported format!");
}

export class BencodedIterator {
  private position = 0;
  constructor(private rawBencoded: string) {}

  next(): Bencoded | undefined {
    const ref = this.rawBencoded.slice(this.position);

    if (ref === "") {
      return undefined;
    }

    const bencoded = toBenecoded(ref);

    if (bencoded === undefined) return bencoded;

    this.position += bencoded.value.length;

    return bencoded;
  }

  rest(): string {
    return this.rawBencoded.slice(this.position);
  }
}
