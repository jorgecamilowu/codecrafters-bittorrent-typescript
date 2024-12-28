import type { Encoder } from "./Encoder";

export class IntegerEncoder implements Encoder {
  encode(value: unknown): string {
    return `i${value}e`;
  }
}
