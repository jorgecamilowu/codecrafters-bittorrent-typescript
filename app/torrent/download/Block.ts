export const BLOCK_SIZE = 2 ** 14;
export class Block {
  constructor(
    readonly pieceIndex: number,
    readonly begin: number,
    readonly length: number,
    public data: Buffer
  ) {}

  encode(): Buffer {
    const buffer = Buffer.alloc(12);
    buffer.writeUInt32BE(this.pieceIndex, 0);
    buffer.writeUInt32BE(this.begin, 4);
    buffer.writeUInt32BE(this.length, 8);

    return buffer;
  }

  static parsePayload(payload: Buffer): {
    index: number;
    begin: number;
    blockData: Buffer;
  } {
    const index = payload.readUint32BE(0);
    const begin = payload.readUint32BE(4);
    const blockData = payload.subarray(8);

    return {
      begin,
      index,
      blockData,
    };
  }
}
