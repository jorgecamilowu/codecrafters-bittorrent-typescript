export function toHex(array: Uint8Array) {
  return array.reduce((acc, curr) => {
    return (acc += curr.toString(16).padStart(2, "0"));
  }, "");
}
