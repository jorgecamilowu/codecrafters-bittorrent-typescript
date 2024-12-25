import type { Bencoded } from "./Bencoded";
import { StringDecoder } from "../decoders/StringDecoder";

export class StringBencoded implements Bencoded {
  private colonPosition: number;
  private length: number;

  constructor(private readonly bencodedValue: string) {
    if (!this.validate()) {
      throw new Error("Invalid string bencoded format!");
    }

    this.colonPosition = this.bencodedValue.indexOf(":");
    this.length = parseInt(this.bencodedValue.slice(0, this.colonPosition));
  }

  static match(bencodedValue: string): boolean {
    return !isNaN(parseInt(bencodedValue[0]));
  }

  private validate() {
    return StringBencoded.match(this.bencodedValue);
  }

  get value() {
    return this.bencodedValue.slice(0, this.length + this.colonPosition + 1);
  }

  get decoder() {
    return new StringDecoder(this);
  }
}
