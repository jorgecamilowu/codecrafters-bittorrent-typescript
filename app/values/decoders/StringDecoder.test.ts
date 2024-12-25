import { describe, it, expect } from "bun:test";
import { StringDecoder } from "./StringDecoder";
import { StringBencoded } from "../StringBencoded";

describe("String decoder", () => {
  it("decodes a string bencoded value", () => {
    const raw = "55:http://bittorrent-test-tracker.codecrafters.io/announce";
    const decoder = new StringDecoder(new StringBencoded(raw));

    expect(decoder.decode()).toBe(
      "http://bittorrent-test-tracker.codecrafters.io/announce"
    );
  });
});
