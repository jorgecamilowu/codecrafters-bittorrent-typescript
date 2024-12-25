import { describe, it, expect } from "bun:test";
import { BencodedIterator } from "./BencodedIterator";

describe("Bencoded Iterator", () => {
  const bencoded =
    "55:http://bittorrent-test-tracker.codecrafters.io/announcei88888e5:hello2:hii8883e0:i23eli44ei55ee";

  it("iterates", () => {
    const iterator = new BencodedIterator(bencoded);

    expect(iterator.next().value).toBe(
      "55:http://bittorrent-test-tracker.codecrafters.io/announce"
    );
    expect(iterator.next().value).toBe("i88888e");
    expect(iterator.next().value).toBe("5:hello");
    expect(iterator.next().value).toBe("2:hi");
    expect(iterator.next().value).toBe("i8883e");
    expect(iterator.next().value).toBe("0:");
    expect(iterator.next().value).toBe("i23e");
    expect(iterator.next().value).toBe("li44ei55ee");
    expect(iterator.next().value).toBe("");
  });
});
