import { describe, it, expect } from "bun:test";
import { IntegerBencoded } from "./IntegerBencoded";

describe("Integer Bencoded", () => {
  const raw =
    "i88888e55:http://bittorrent-test-tracker.codecrafters.io/announce";
  const intBencoded = new IntegerBencoded(raw);

  it("reads the current int bencoded value", () => {
    expect(intBencoded.value).toBe("i88888e");
  });
});
