export class ByteIterator {
  private cursor: number;

  constructor(private data: string) {
    this.cursor = 0;
  }

  skip(target: number) {
    this.cursor += target;

    return this;
  }

  next(step: number) {
    const ref = this.data.slice(this.cursor, this.cursor + step);

    if (ref === "") {
      return undefined;
    }

    this.cursor += step;

    return Uint8Array.from(ref, (char) => char.charCodeAt(0));
  }
}
