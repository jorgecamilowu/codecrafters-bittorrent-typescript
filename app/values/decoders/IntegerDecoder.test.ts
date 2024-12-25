import { describe, it, expect } from "bun:test";
import { IntegerBencoded } from "../IntegerBencoded";
import { IntegerDecoder } from "./IntegerDecoder";

describe("Integer decoder", () => {
  it("decodes an integer bencoded value", () => {
    const raw = "i88888e";
    const decoder = new IntegerDecoder(new IntegerBencoded(raw));

    expect(decoder.decode()).toBe(88888);
  });
});
