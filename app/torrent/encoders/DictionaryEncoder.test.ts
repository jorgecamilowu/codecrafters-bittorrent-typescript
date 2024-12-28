import { describe, it, expect } from "bun:test";
import { DictionaryEncoder } from "./DictionaryEncoder";

describe("Dictionary Encodder", () => {
  const encoder = new DictionaryEncoder();
  it("encodes a dictionary with the keys sorted lexicographically", () => {
    const d = {
      hello: 52,
      foo: {
        nested: {
          b: "world",
          a: "hello",
        },
        hi: 5,
      },
    };

    expect(encoder.encode(d)).toBe(
      "d3:food2:hii5e6:nestedd1:a5:hello1:b5:worldee5:helloi52ee"
    );
  });

  it("encodes an empty dictionary", () => {
    expect(encoder.encode({})).toBe("de");
  });
});
