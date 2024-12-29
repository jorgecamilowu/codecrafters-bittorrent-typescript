import { DictionaryEncoder } from "../torrent/encoders";
import { TorrentReader } from "../torrent/reader";
import { toBenecoded } from "../torrent/values";
import { generateRandomId, urlEncode } from ".";

export async function fetchPeers(filePath: string) {
  const reader = new TorrentReader();

  const torrent = reader.read(filePath);

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

  const binaryDecoder = new TextDecoder("latin1");

  const result = binaryDecoder.decode(await response.arrayBuffer());

  return toBenecoded(result).decoder.decode();
}
