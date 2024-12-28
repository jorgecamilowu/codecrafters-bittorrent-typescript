import type { Encoder } from "./Encoder";

export class StringEncoder implements Encoder {
  encode(value: string): string {
    return `${value.length}:${value}`;
  }
}
