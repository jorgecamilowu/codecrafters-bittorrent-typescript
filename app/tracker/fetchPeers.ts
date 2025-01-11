import { DictionaryEncoder } from "../torrent/encoders";
import { toBenecoded } from "../torrent/values";
import type { TorrentMeta } from "../torrent/TorrentMeta";
import type { TrackerResponse } from "./TrackerResponse";
import { ByteIterator, urlEncode, generateRandomId } from "../util";
import { Peer } from "../peer";

export async function* fetchPeers(torrent: TorrentMeta) {
  const bencoded = new DictionaryEncoder().encode(torrent.info);

  const hashed = new Bun.CryptoHasher("sha1")
    .update(bencoded, "latin1")
    .digest();

  const url = new URL(torrent.announce);

  url.searchParams.set("peer_id", generateRandomId(20));
  url.searchParams.set("port", "6881");
  url.searchParams.set("uploaded", "0");
  url.searchParams.set("downloaded", "0");
  url.searchParams.set("compact", "1");
  url.searchParams.set("left", torrent.info.length.toString());

  const response = await fetch(`${url}&info_hash=${urlEncode(hashed)}`, {
    method: "GET",
  });

  const result = Buffer.from(await response.arrayBuffer()).toString("latin1");

  const { peers } = toBenecoded(
    result
  ).decoder.decode() as unknown as TrackerResponse;

  const iter = new ByteIterator(peers);

  let piece = iter.next(6);

  while (piece) {
    const ip = piece.slice(0, 4).join(".");

    const port = Buffer.from(piece.slice(4)).readUintBE(0, 2);

    yield new Peer(ip, port);

    piece = iter.next(6);
  }
}
