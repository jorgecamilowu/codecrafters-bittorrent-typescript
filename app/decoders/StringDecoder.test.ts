import { describe, it, expect } from "bun:test";
import { StringDecoder } from "./StringDecoder";
describe("String decoder", () => {
  const decoder = new StringDecoder();
  it("decodes strings", () => {
    expect(decoder.decode("5:hello1234")).toBe("hello1234");
    expect(decoder.decode("5:hello")).toBe("hello");
    expect(decoder.decode("2:hi")).toBe("hi");
  });

  it("decodes empty strings", () => {
    expect(decoder.decode("0:")).toBe("");
  });
});
