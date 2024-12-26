// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"

import fs from "fs";
import { toBenecoded } from "./values/Bencoded";
import { DictionaryBencoded } from "./values/DictionaryBencoded";
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

  const hashed = new Bun.CryptoHasher("sha1")
    .update(bencodedInfo, "binary")
    .digest("hex");

  console.log(`Tracker URL: ${torrent.announce}`);
  console.log(`Length: ${torrent.info.length}`);
  console.log(`Info Hash: ${hashed}`);
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
}
