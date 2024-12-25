import type { Bencoded } from "./Bencoded";

export class IntegerBencoded implements Bencoded {
  private lastIndex: number;

  constructor(private bencodedValue: string) {
    this.lastIndex = this.bencodedValue.indexOf("e");

    if (this.lastIndex === -1) {
      throw new Error(
        "No ending 'e' found for the current integer encoded value",
        {
          cause: {
            bencodedValue,
          },
        }
      );
    }
  }

  static match(bencodedValue: string): boolean {
    return bencodedValue[0] === "i";
  }

  get value() {
    return this.bencodedValue.slice(0, this.lastIndex + 1);
  }
}
