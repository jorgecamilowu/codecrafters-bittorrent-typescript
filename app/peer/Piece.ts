import type { Block } from "../torrent/download/Block";

export class Piece {
  constructor(readonly data: Buffer) {}
  static fromBlocks(blocks: Block[]) {
    const joined = blocks
      .toSorted((a, b) => a.begin - b.begin)
      .reduce((acc, curr) => {
        return Buffer.concat([acc, curr.data]);
      }, Buffer.alloc(0));

    return new Piece(joined);
  }
}
