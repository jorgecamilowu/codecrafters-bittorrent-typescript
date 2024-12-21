import { describe, it, expect } from "bun:test";
import { decodeBencode } from "./main";

describe("main tests", () => {
  it("decodes a string", () => {
    const bencoded = "5:hello";

    expect(decodeBencode(bencoded)).toEqual("hello");
  });
  it("decodes an integer", () => {
    const bencoded = "i598e";

    expect(decodeBencode(bencoded)).toEqual(598);
  });
  it("decodes a list", () => {
    const bencoded = "li1ei2e2:hii223ei-5e5:helloe";

    expect(decodeBencode(bencoded)).toEqual([1, 2, "hi", 223, -5, "hello"]);
  });
});
