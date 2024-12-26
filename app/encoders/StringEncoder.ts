export class StringEncoder {
  encode(value: string): string {
    return `${value.length}:${value}`;
  }
}
