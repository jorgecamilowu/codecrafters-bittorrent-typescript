import { describe, it, expect } from "bun:test";
import { DictionaryBencoded } from "../values/DictionaryBencoded";

describe("Dictionary Decoder", () => {
  it("decodes a dictionary", () => {
    const raw = "d4:listli1ei2ed6:nestedi1eee3:food2:hii5ee5:helloi52ee";

    const encoded = new DictionaryBencoded(raw);

    expect(encoded.decoder.decode()).toEqual({
      list: [
        1,
        2,
        {
          nested: 1,
        },
      ],
      foo: {
        hi: 5,
      },
      hello: 52,
    });
  });

  it("decodes an empty dictionary", () => {
    const encoded = new DictionaryBencoded("de");

    expect(encoded.decoder.decode()).toEqual({});
  });
});
