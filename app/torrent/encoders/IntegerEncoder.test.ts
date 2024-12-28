import { describe, it, expect } from "bun:test";
import { IntegerEncoder } from "./IntegerEncoder";

describe("Integer Encoder", () => {
  const encoder = new IntegerEncoder();

  it("encodes an integer", () => {
    expect(encoder.encode(15)).toBe("i15e");
  });
});
