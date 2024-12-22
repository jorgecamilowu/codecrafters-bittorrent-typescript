// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"

import { DictionaryDecoder } from "./decoders/DictionaryDecoder";
import { IntegerDecoder } from "./decoders/IntegerDecoder";
import { ListDecoder } from "./decoders/ListDecoder";
import { StringDecoder } from "./decoders/StringDecoder";

const dictionaryDecoder = new DictionaryDecoder();

const decoders = [
  new StringDecoder(),
  new IntegerDecoder(),
  new ListDecoder(),
  dictionaryDecoder,
];

export function decodeBencode(bencodedValue: string) {
  const decoder = decoders.find((decoder) => decoder.match(bencodedValue));

  if (!decoder) {
    throw new Error("Unsupported format!");
  }

  return decoder.decode(bencodedValue);
}

export async function info(filePath: string) {
  const file = await Bun.file(filePath).text();

  const torrentInfo = dictionaryDecoder.decode(file);

  console.log(`Tracker URL: ${torrentInfo.announce}`);
  console.log(`Length: ${torrentInfo.info["piece length"]}`);
}

const args = process.argv;
const bencodedValue = args[3];

if (args[2] === "decode") {
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
  info(bencodedValue);
}
