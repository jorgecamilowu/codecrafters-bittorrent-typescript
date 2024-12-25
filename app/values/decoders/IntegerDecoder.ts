import type { IntegerBencoded } from "../IntegerBencoded";
import type { Decoder } from "./Decoder";

export class IntegerDecoder implements Decoder {
  constructor(private bencoded: IntegerBencoded) {}

  decode(): number {
    const { value } = this.bencoded;

    const stringInt = value.slice(1, value.length - 1);

    if (stringInt === "") {
      return 0;
    }

    const output = parseInt(stringInt);

    if (isNaN(output)) {
      throw new Error("Could not parse out value", {
        cause: { bencodedValue: this.bencoded },
      });
    }

    return output;
  }
}
