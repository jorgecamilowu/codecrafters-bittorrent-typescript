import { describe, it, expect } from "bun:test";
import { DictionaryBencoded } from "./DictionaryBencoded";

describe("Dictionary Bencoded", () => {
  it("reads the current dictionary", () => {
    const raw = "d3:food2:hii5ee5:helloi52eei99e";
    const d = new DictionaryBencoded(raw);

    expect(d.value).toBe("d3:food2:hii5ee5:helloi52ee");
  });

  it("throws error when constructing with a non-dictionary bencoded value", () => {
    expect(() => new DictionaryBencoded("2:hi")).toThrow(
      "Invalid dictionary bencoded format!"
    );
  });
});
