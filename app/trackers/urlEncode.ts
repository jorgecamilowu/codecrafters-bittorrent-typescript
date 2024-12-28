export function urlEncode(buf: Buffer): string {
  const byteArray = new Uint8Array(buf);

  return Array.from(byteArray, (byte) => {
    const char = String.fromCodePoint(byte);

    // unreserved url characters
    return /^[A-Za-z0-9_.!~*'()-]$/.test(char)
      ? char
      : `%${byte.toString(16).padStart(2, "0")}`;
  }).join("");
}
