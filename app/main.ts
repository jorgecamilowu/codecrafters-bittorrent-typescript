// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"

import { IntegerDecoder } from "./decoders/IntegerDecoder";
import { ListDecoder } from "./decoders/ListDecoder";
import { StringDecoder } from "./decoders/StringDecoder";

export function decodeBencode(bencodedValue: string) {
  const intDecoder = new IntegerDecoder();
  const stringDecoder = new StringDecoder();
  const listDecoder = new ListDecoder();

  const decoders = [stringDecoder, intDecoder, listDecoder];

  const decoder = decoders.find((decoder) => decoder.match(bencodedValue));

  if (!decoder) {
    throw new Error("Unsupported format!");
  }

  return decoder.decode(bencodedValue);
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
    console.error(error.message);
  }
}
