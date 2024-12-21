import { describe, it, expect, beforeEach } from "bun:test";
import { ListDecoder } from "./ListDecoder";
import type { Decoder } from "./Decoder";

describe("List Decoder", () => {
  let decoder: Decoder;

  beforeEach(() => {
    decoder = new ListDecoder();
  });

  it("takes the next list element", () => {
    const encoded = "lli23e2:hii8eeeli44ei55ee";
    const [next, rest] = decoder.takeNext(encoded);
    expect(next).toBe("lli23e2:hii8eee");
    expect(rest).toBe("li44ei55ee");
  });

  it("decodes an empty list", () => {
    expect(decoder.decode("le")).toEqual([]);
  });

  it("decodes a list of Integer bencoded values", () => {
    expect(decoder.decode("li1ei2e2:hii223ei-5e5:helloe")).toEqual([
      1,
      2,
      "hi",
      223,
      -5,
      "hello",
    ]);
  });

  it("decodes nested lists", () => {
    const result = decoder.decode("llli869e6:bananaeel5:helloi99eee");

    expect(result).toEqual([[[869, "banana"]], ["hello", 99]]);
  });
});
