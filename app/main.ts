import { toBenecoded } from "./values/Bencoded";
import { DictionaryEncoder } from "./encoders/DictionaryEncoder";
import { ByteIterator } from "./ByteIterator";
import { TorrentReader } from "./reader/TorrentReader";

export function decodeBencode(bencodedValue: string) {
  const bencoded = toBenecoded(bencodedValue);

  return bencoded.decoder.decode();
}

function toHex(array: Uint8Array) {
  return array.reduce((acc, curr) => {
    return (acc += curr.toString(16).padStart(2, "0"));
  }, "");
}

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
function generateRandomId(length: number) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map((value) => charset[value % charset.length])
    .join("");
}
function urlEncode(buf: Buffer): string {
  const byteArray = new Uint8Array(buf);

  return Array.from(byteArray, (byte) => {
    const char = String.fromCodePoint(byte);

    // unreserved url characters
    return /^[A-Za-z0-9_.!~*'()-]$/.test(char)
      ? char
      : `%${byte.toString(16).padStart(2, "0")}`;
  }).join("");
}

async function fetchPeers(filePath: string) {
  const reader = new TorrentReader();

  const torrent = reader.read(filePath);

  const bencoded = new DictionaryEncoder().encode(torrent.info);

  const hashed = new Bun.CryptoHasher("sha1")
    .update(bencoded, "binary")
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

  const arr = new Uint8Array(await response.arrayBuffer()).toString();

  return toBenecoded(arr).decoder.decode();
}

const args = process.argv;

if (args[2] === "decode") {
  const bencodedValue = args[3];
  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  // Uncomment this block to pass the first stage
  try {
    const decoded = decodeBencode(bencodedValue);
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
