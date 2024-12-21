import { describe, it, expect } from "bun:test";
import { StringDecoder } from "./StringDecoder";
describe("String decoder", () => {
  const decoder = new StringDecoder();

  it("decodes strings", () => {
    expect(decoder.decode("5:hello1234")).toBe("hello1234");
    expect(decoder.decode("5:hello")).toBe("hello");
    expect(decoder.decode("2:hi")).toBe("hi");
  });

  it("decodes strings with multiple digit length", () => {
    expect(
      decoder.decode(
        "55:http://bittorrent-test-tracker.codecrafters.io/announce"
      )
    ).toBe("http://bittorrent-test-tracker.codecrafters.io/announce");
  });

  it("decodes empty strings", () => {
    expect(decoder.decode("0:")).toBe("");
  });

  it("takes the next string", () => {
    const encoded =
      "55:http://bittorrent-test-tracker.codecrafters.io/announcei88888e";

    const [next, rest] = decoder.takeNext(encoded);
    expect(next).toBe(
      "55:http://bittorrent-test-tracker.codecrafters.io/announce"
    );
    expect(rest).toBe("i88888e");
  });
});
