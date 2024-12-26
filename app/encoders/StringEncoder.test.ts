import { describe, it, expect } from "bun:test";
import { StringEncoder } from "./StringEncoder";

describe("String Encoder", () => {
  const encoder = new StringEncoder();
  it("bencodes a string", () => {
    expect(encoder.encode("hello")).toBe("5:hello");
  });

  it("bencodes an empty string", () => {
    expect(encoder.encode("")).toBe("0:");
    expect(encoder.encode(" ")).toBe("1: ");
  });
});
