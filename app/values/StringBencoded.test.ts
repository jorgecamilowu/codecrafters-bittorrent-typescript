import { describe, it, expect } from "bun:test";
import { StringBencoded } from "./StringBencoded";
import { StringDecoder } from "../decoders/StringDecoder";

describe("String Bencoded", () => {
  const raw =
    "55:http://bittorrent-test-tracker.codecrafters.io/announcei88888e";
  const stringBencoded = new StringBencoded(raw);

  it("throws error when constructing with a non-string bencoded value", () => {
    expect(() => new StringBencoded("i23e")).toThrow(
      "Invalid string bencoded format!"
    );
  });

  it("reads the current string bencoded value", () => {
    expect(stringBencoded.value).toBe(
      "55:http://bittorrent-test-tracker.codecrafters.io/announce"
    );
  });

  it("reads empty string values", () => {
    const stringBencoded = new StringBencoded("0:i23e");
    expect(stringBencoded.value).toBe("0:");
  });

  it("returns a string decoder", () => {
    expect(stringBencoded.decoder).toBeInstanceOf(StringDecoder);
  });
});
