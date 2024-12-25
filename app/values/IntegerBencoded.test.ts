import { describe, it, expect } from "bun:test";
import { IntegerBencoded } from "./IntegerBencoded";
import { IntegerDecoder } from "./decoders/IntegerDecoder";

describe("Integer Bencoded", () => {
  const raw =
    "i88888e55:http://bittorrent-test-tracker.codecrafters.io/announce";
  const intBencoded = new IntegerBencoded(raw);

  it("throws error when constructing with a non-string bencoded value", () => {
    expect(() => new IntegerBencoded("2:hi")).toThrow(
      "Invalid integer bencoded format!"
    );
  });

  it("throws error when given badly formatted input", () => {
    expect(() => new IntegerBencoded("i2349")).toThrow(
      "Invalid integer bencoded format!"
    );

    expect(() => new IntegerBencoded("i2349a")).toThrow(
      "Invalid integer bencoded format!"
    );
  });

  it("reads the current int bencoded value", () => {
    expect(intBencoded.value).toBe("i88888e");
  });

  it("returns an IntegerDecoder", () => {
    const { decoder } = intBencoded;

    expect(decoder).toBeInstanceOf(IntegerDecoder);
  });
});
