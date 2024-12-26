// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"

import fs from "fs";
import { toBenecoded } from "./values/Bencoded";
import { DictionaryBencoded } from "./values/DictionaryBencoded";
import { DictionaryEncoder } from "./encoders/DictionaryEncoder";

export function decodeBencode(bencodedValue: string) {
  const bencoded = toBenecoded(bencodedValue);

  return bencoded.decoder.decode();
}

export async function info(filePath: string) {
  const file = fs.readFileSync(filePath).toString("binary");

  const torrentInfo = new DictionaryBencoded(file).decoder.decode() as {
    announce: string;
    info: { length: string };
  };

  console.log(`Tracker URL: ${torrentInfo.announce}`);
  console.log(`Length: ${torrentInfo.info.length}`);

  const bencodedInfo = new DictionaryEncoder().encode(torrentInfo.info);

  const hashed = new Bun.CryptoHasher("sha1", bencodedInfo)
    .digest()
    .toString("hex");

  console.log(`Info Hash: ${hashed}`);
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
