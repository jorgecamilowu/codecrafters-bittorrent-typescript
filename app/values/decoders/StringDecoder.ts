import type { StringBencoded } from "../StringBencoded";

export class StringDecoder {
  constructor(private bencoded: StringBencoded) {}

  decode(): string {
    const { value } = this.bencoded;

    return value.slice(value.indexOf(":") + 1);
  }
}
