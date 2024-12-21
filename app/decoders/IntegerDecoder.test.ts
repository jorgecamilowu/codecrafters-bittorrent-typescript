import { describe, it, expect } from "bun:test";
import { IntegerDecoder } from "./IntegerDecoder";
describe("Integer decoder", () => {
  const decoder = new IntegerDecoder();

  it("decodes integers", () => {
    expect(decoder.decode("i25e")).toBe(25);
  });

  it("decodes negative integers", () => {
    expect(decoder.decode("i-100e")).toBe(-100);
  });

  it("decodes zeroes", () => {
    expect(decoder.decode("i00e")).toBe(0);
    expect(decoder.decode("i0e")).toBe(0);
  });

  it("decodes empty", () => {
    expect(decoder.decode("ie")).toBe(0);
  });
});
