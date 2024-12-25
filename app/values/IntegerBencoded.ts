import type { Bencoded } from "./Bencoded";
import { IntegerDecoder } from "../decoders/IntegerDecoder";

export class IntegerBencoded implements Bencoded {
  private lastIndex: number;

  constructor(private bencodedValue: string) {
    this.lastIndex = this.bencodedValue.indexOf("e");

    if (!this.validate() || this.lastIndex === -1) {
      throw new Error("Invalid integer bencoded format!", {
        cause: {
          bencodedValue,
        },
      });
    }
  }

  static match(bencodedValue: string): boolean {
    return bencodedValue[0] === "i";
  }

  private validate() {
    return this.bencodedValue[0] === "i";
  }

  get value() {
    return this.bencodedValue.slice(0, this.lastIndex + 1);
  }

  get decoder() {
    // temp
    return new IntegerDecoder(this);
  }
}
