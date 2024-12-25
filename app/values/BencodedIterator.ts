import { toBenecoded, type Bencoded } from "./Bencoded";

export class BencodedIterator {
  private position = 0;
  constructor(private rawBencoded: string) {}

  next(): Bencoded | undefined {
    const ref = this.rest();

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
