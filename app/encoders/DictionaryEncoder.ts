import type { Encoder } from "./Encoder";
import { IntegerEncoder } from "./IntegerEncoder";
import { StringEncoder } from "./StringEncoder";

export class DictionaryEncoder implements Encoder {
  private keyEncoder: StringEncoder;

  constructor() {
    this.keyEncoder = new StringEncoder();
  }

  private getEncoder(value: unknown): Encoder {
    if (typeof value === "string") {
      return new StringEncoder();
    }

    if (typeof value === "number") {
      return new IntegerEncoder();
    }

    if (typeof value === "object") {
      return this;
    }

    throw new Error("Unsupported value");
  }

  encode(value: Record<string, unknown>): string {
    const keyValues: [string, unknown][] = Object.entries(value);

    keyValues.sort(([keyA], [keyB]) => {
      if (keyA < keyB) {
        return -1;
      }

      if (keyA > keyB) {
        return 1;
      }

      return 0;
    });

    const encoded: [string, string][] = keyValues.map(([key, value]) => {
      const valueEncoder = this.getEncoder(value);

      return [this.keyEncoder.encode(key), valueEncoder.encode(value)];
    });

    return `d${encoded.flat().join("")}e`;
  }
}
