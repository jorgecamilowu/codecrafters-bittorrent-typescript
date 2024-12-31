export function urlEncode(buf: Buffer): string {
  return Array.from(buf, (byte) => {
    const char = String.fromCodePoint(byte);

    // unreserved url characters
    return /^[A-Za-z0-9_.!~*'()-]$/.test(char)
      ? char
      : `%${byte.toString(16).padStart(2, "0")}`;
  }).join("");
}
