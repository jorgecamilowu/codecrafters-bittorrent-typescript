import { invariant } from "../../util";
import type { IntegerBencoded } from "../values/IntegerBencoded";
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

    invariant(!isNaN(output), "Could not parse out value");

    return output;
  }
}
