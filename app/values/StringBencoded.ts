import type { Bencoded } from "./Bencoded";
import { StringDecoder } from "./decoders/StringDecoder";

export class StringBencoded implements Bencoded {
  private colonPosition: number;
  private length: number;

  constructor(private readonly bencodedValue: string) {
    this.colonPosition = this.bencodedValue.indexOf(":");
    this.length = parseInt(this.bencodedValue.slice(0, this.colonPosition));
  }

  static match(bencodedValue: string): boolean {
    return !isNaN(parseInt(bencodedValue[0]));
  }

  get value() {
    return this.bencodedValue.slice(0, this.length + this.colonPosition + 1);
  }

  get decoder() {
    return new StringDecoder(this);
  }
}
