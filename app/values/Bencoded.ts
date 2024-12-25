import type { Decoder } from "../decoders/Decoder";

export interface Bencoded {
  value: string;
  decoder: Decoder;
}
