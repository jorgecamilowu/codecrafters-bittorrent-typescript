import { toBenecoded, type Bencoded } from "./Bencoded";

export class BencodedIterator {
  private cursor = 0;
  constructor(private rawBencoded: string) {}

  /**
   * @returns the next Bencoded value in the iterator
   */
  next(): Bencoded | undefined {
    const ref = this.unwrap();

    if (ref === "") {
      return undefined;
    }

    const bencoded = toBenecoded(ref);

    if (bencoded === undefined) return bencoded;

    this.cursor += bencoded.value.length;

    return bencoded;
  }

  /**
   * @returns the raw bencoded value at the current cursor of the iterator
   */
  unwrap(): string {
    return this.rawBencoded.slice(this.cursor);
  }
}
