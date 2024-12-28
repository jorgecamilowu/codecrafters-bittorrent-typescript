import { fetchPeers } from "./trackers/fetchPeers";
import { DictionaryEncoder } from "./torrent/encoders";
import { ByteIterator, toHex } from "./torrent/hashing";
import { TorrentReader } from "./torrent/reader";
import { toBenecoded } from "./torrent/values";

function info(filePath: string) {
  const reader = new TorrentReader();

  const torrent = reader.read(filePath);

  const bencodedInfo = new DictionaryEncoder().encode(torrent.info);

  const infoHash = new Bun.CryptoHasher("sha1")
    .update(bencodedInfo, "binary")
    .digest("hex");

  console.log(`Tracker URL: ${torrent.announce}`);
  console.log(`Length: ${torrent.info.length}`);
  console.log(`Info Hash: ${infoHash}`);
  console.log(`Piece Length: ${torrent.info["piece length"]}`);
  console.log("Piece Hashes:");

  const iter = new ByteIterator(torrent.info.pieces);

  let piece = iter.next(20);
  while (piece) {
    console.log(toHex(piece));

    piece = iter.next(20);
  }
}
const args = process.argv;

if (args[2] === "decode") {
  const bencodedValue = args[3];
  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  // Uncomment this block to pass the first stage
  try {
    const decoded = toBenecoded(bencodedValue).decoder.decode();

    console.log(JSON.stringify(decoded));
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
} else if (args[2] === "info") {
  const torrentFilePath = args[3];
  info(torrentFilePath);
} else if (args[2] === "peers") {
  const torrentFilePath = args[3];
  console.log(await fetchPeers(torrentFilePath));
}
