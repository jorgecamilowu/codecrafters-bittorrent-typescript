import { describe, it, expect } from "bun:test";
import { ListBencoded } from "../values/ListBencoded";
import { ListDecoder } from "./ListDecoder";

describe("List decoder", () => {
  it("decodes a list bencoded value", () => {
    const raw = "llli869e6:bananaeel5:helloi99eee";
    const decoder = new ListDecoder(new ListBencoded(raw));

    expect(decoder.decode()).toEqual([[[869, "banana"]], ["hello", 99]]);
  });

  it("decodes an empty list", () => {
    const decoder = new ListDecoder(new ListBencoded("le"));

    expect(decoder.decode()).toEqual([]);
  });
});
