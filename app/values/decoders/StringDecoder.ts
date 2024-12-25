import type { StringBencoded } from "../StringBencoded";
import type { Decoder } from "./Decoder";

export class StringDecoder implements Decoder {
  constructor(private bencoded: StringBencoded) {}

  decode(): string {
    const { value } = this.bencoded;

    return value.slice(value.indexOf(":") + 1);
  }
}
