import { describe, it, expect } from "bun:test";
import { StringBencoded } from "./StringBencoded";

describe("String Bencoded", () => {
  const raw =
    "55:http://bittorrent-test-tracker.codecrafters.io/announcei88888e";
  const stringBencoded = new StringBencoded(raw);

  it("reads the current string bencoded value", () => {
    expect(stringBencoded.value).toBe(
      "55:http://bittorrent-test-tracker.codecrafters.io/announce"
    );
  });

  it("reads empty string values", () => {
    const stringBencoded = new StringBencoded("0:i23e");
    expect(stringBencoded.value).toBe("0:");
  });
});
