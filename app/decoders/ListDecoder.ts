import { BencodedIterator } from "../values/BencodedIterator";
import type { ListBencoded } from "../values/ListBencoded";
import type { Decoder } from "./Decoder";

export class ListDecoder implements Decoder {
  constructor(private bencoded: ListBencoded) {}

  decode(): unknown[] {
    const { value } = this.bencoded;
    const body = value.slice(1, value.length - 1);

    if (body === "") {
      return [];
    }

    return this.recurse(body);
  }

  private recurse(bencodedValue: string): unknown[] {
    const decodedValues: unknown[] = [];

    const iter = new BencodedIterator(bencodedValue);

    const next = iter.next();

    if (next === undefined) {
      return decodedValues;
    }

    const decoded = next.decoder.decode();

    decodedValues.push(decoded);

    const rest = iter.rest();

    if (rest) {
      decodedValues.push(...this.recurse(rest));
    }

    return decodedValues;
  }
}
