import { describe, it, expect } from "bun:test";
import { ListDecoder } from "./ListDecoder";
import { IntegerDecoder } from "./IntegerDecoder";
import { StringDecoder } from "./StringDecoder";

describe("List Decoder", () => {
  it("decodes an empty list", () => {
    const decoder = new ListDecoder([
      new IntegerDecoder(),
      new StringDecoder(),
    ]);

    const bencoded = "le";

    expect(decoder.decode(bencoded)).toEqual([]);
  });

  it("decodes a list of Integer bencoded values", () => {
    const decoder = new ListDecoder([
      new IntegerDecoder(),
      new StringDecoder(),
    ]);

    const bencoded = "li1ei2e2:hii223ei-5e5:helloe";

    expect(decoder.decode(bencoded)).toEqual([1, 2, "hi", 223, -5, "hello"]);
  });
});
