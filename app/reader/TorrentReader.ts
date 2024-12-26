import fs from "fs";
import { DictionaryBencoded } from "../values/DictionaryBencoded";

export class TorrentReader {
  read(filePath: string) {
    const file = fs.readFileSync(filePath).toString("binary");

    return new DictionaryBencoded(file).decoder.decode() as {
      announce: string;
      info: { length: number; ["piece length"]: number; pieces: string };
    };
  }
}
