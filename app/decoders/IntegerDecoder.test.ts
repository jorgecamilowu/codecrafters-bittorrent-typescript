import { describe, it, expect } from "bun:test";
import { IntegerBencoded } from "../values/IntegerBencoded";
import { IntegerDecoder } from "./IntegerDecoder";

describe("Integer decoder", () => {
  it("decodes an integer bencoded value", () => {
    const raw = "i88888e";
    const decoder = new IntegerDecoder(new IntegerBencoded(raw));

    expect(decoder.decode()).toBe(88888);
  });

  it("decodes falsy integers", () => {
    let decoder = new IntegerDecoder(new IntegerBencoded("ie"));
    expect(decoder.decode()).toBe(0);

    decoder = new IntegerDecoder(new IntegerBencoded("i0e"));
    expect(decoder.decode()).toBe(0);

    decoder = new IntegerDecoder(new IntegerBencoded("i0000e"));
    expect(decoder.decode()).toBe(0);
  });
});
