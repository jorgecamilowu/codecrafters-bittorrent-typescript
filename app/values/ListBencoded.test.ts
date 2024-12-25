import { describe, it, expect } from "bun:test";
import { ListBencoded } from "./ListBencoded";
describe("List Bencoded", () => {
  it("reads the current list", () => {
    const raw = "lli23e2:hii8eeeli44ei55ee";

    const l = new ListBencoded(raw);

    expect(l.value).toBe("lli23e2:hii8eee");
  });

  it("throws error when constructing with a non-list bencoded value", () => {
    expect(() => new ListBencoded("2:hi")).toThrow(
      "Invalid list bencoded format!"
    );
  });
});
