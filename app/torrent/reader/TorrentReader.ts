import fs from "fs";
import { DictionaryBencoded } from "../values/DictionaryBencoded";
import type { TorrentMeta } from "../TorrentMeta";

export class TorrentReader {
  read(filePath: string) {
    const file = fs.readFileSync(filePath).toString("binary");

    return new DictionaryBencoded(file).decoder.decode() as TorrentMeta;
  }
}
