import { describe, it, expect } from "bun:test";
import { DictionaryDecoder } from "./DictionaryDecoder";

describe("Dictionary Decoder", () => {
  const decoder = new DictionaryDecoder();

  it("matches on dictionary bencoded values", () => {
    expect(decoder.match("d3:foo3:bar5:helloi52ee")).toBeTrue();
  });

  it("takes the next dictionary", () => {
    const bencoded = "d3:food2:hii5ee5:helloi52eei99e";
    const [next, rest] = decoder.takeNext(bencoded);
    expect(next).toBe("d3:food2:hii5ee5:helloi52ee");
    expect(rest).toBe("i99e");
  });

  it("decodes empty dictionaries", () => {
    expect(decoder.decode("de")).toEqual({});
  });

  it("decodes a dictionary", () => {
    const bencoded = "d4:listli1ei2ee3:food2:hii5ee5:helloi52ee";
    // const bencoded = "d4:listli1ei2ed6:nestedi1eee3:food2:hii5ee5:helloi52ee";

    expect(decoder.decode(bencoded)).toEqual({
      list: [
        1, 2,
        // {
        //   nested: 1,
        // },
      ],
      foo: {
        hi: 5,
      },
      hello: 52,
    });
  });
});
