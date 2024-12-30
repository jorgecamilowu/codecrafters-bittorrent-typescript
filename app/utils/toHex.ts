export function toHex(target: Uint8Array): string;
export function toHex(target: string): string;
export function toHex(target: Uint8Array | string) {
  const iterable =
    typeof target === "string"
      ? Uint8Array.from(target, (char) => char.charCodeAt(0))
      : target;

  return iterable.reduce(
    (acc, curr) => (acc += curr.toString(16).padStart(2, "0")),
    ""
  );
}
