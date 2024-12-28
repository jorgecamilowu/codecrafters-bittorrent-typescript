import type { Decoder } from "../decoders/Decoder";
import { DictionaryBencoded } from "./DictionaryBencoded";
import { IntegerBencoded } from "./IntegerBencoded";
import { ListBencoded } from "./ListBencoded";
import { StringBencoded } from "./StringBencoded";

export interface Bencoded {
  value: string;
  decoder: Decoder;
}
export function toBenecoded(bencoded: string) {
  if (StringBencoded.match(bencoded)) {
    return new StringBencoded(bencoded);
  }

  if (IntegerBencoded.match(bencoded)) {
    return new IntegerBencoded(bencoded);
  }

  if (ListBencoded.match(bencoded)) {
    return new ListBencoded(bencoded);
  }

  if (DictionaryBencoded.match(bencoded)) {
    return new DictionaryBencoded(bencoded);
  }

  throw new Error("Unsupported bencoding format!");
}
