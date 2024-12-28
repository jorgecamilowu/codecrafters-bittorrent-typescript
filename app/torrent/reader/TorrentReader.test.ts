import { describe, it, expect } from "bun:test";
import { TorrentReader } from "./TorrentReader";

describe("Torrent Reader", () => {
  const reader = new TorrentReader();

  it("reads a torrent file", () => {
    const torrent = reader.read("sample.torrent");

    expect(torrent.announce).toBe(
      "http://bittorrent-test-tracker.codecrafters.io/announce"
    );

    expect(torrent.info.length).toBe(92063);
    expect(torrent.info["piece length"]).toBe(32768);
  });
});
