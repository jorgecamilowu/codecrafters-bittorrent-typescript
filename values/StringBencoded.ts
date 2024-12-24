import type { Bencoded } from "./Readable";

export class StringBencoded implements Bencoded {
  private colonPosition: number;
  private length: number;

  constructor(private readonly bencodedValue: string) {
    this.colonPosition = this.bencodedValue.indexOf(":");
    this.length = parseInt(this.bencodedValue.slice(0, this.colonPosition));
  }

  get value() {
    return this.bencodedValue.slice(0, this.length + this.colonPosition + 1);
  }
}
