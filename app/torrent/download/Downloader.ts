import type { Socket } from "bun";
import { Message, Tag } from "../../peer/Message";

const BLOCK_SIZE = 2 ** 14;

class Block {
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

  fill(payload: Buffer) {
    if (payload.length !== this.length) {
      throw new Error("Attempted to fill Block with mismatched payload size");
    }

    this.data = payload;
  }

  static parsePayload(payload: Buffer): {
    index: number;
    begin: number;
    blockData: Buffer;
  } {
    const index = payload.readUintBE(0, 4);
    const begin = payload.readUintBE(0, 4);
    const blockData = payload.subarray(8);

    return {
      begin,
      index,
      blockData,
    };
  }
}

export class Downloader {
  blocks: Block[];

  constructor(private pieceIndex: number, private pieceLength: number) {
    const nBlocks = Math.ceil(this.pieceLength / BLOCK_SIZE);
    this.blocks = Array.from({ length: nBlocks }, (_, index) => {
      // all blocks have BLOCK_SIZE except for the last one
      const blockLength = Math.min(
        BLOCK_SIZE,
        this.pieceLength - index * BLOCK_SIZE
      );

      return new Block(
        this.pieceIndex,
        index * BLOCK_SIZE,
        blockLength,
        Buffer.from([])
      );
    });
  }

  private nextEmptyBlock(): Block | undefined {
    return this.blocks.find((block) => block.data.length === 0);
  }

  downloadPiece(socket: Socket, message: Message) {
    switch (message.tag) {
      case Tag.CHOKE:
        break;
      case Tag.UNCHOKE:
        const block = this.nextEmptyBlock();

        if (block === undefined) {
          throw new Error("No blocks were initialized!");
        }

        const request = new Message(Tag.REQUEST, block.encode());

        socket.write(Uint8Array.from(request.encode()));

        break;
      case Tag.INTERESTED:
        break;
      case Tag.NOT_INTERESTED:
        break;
      case Tag.HAVE:
        break;
      case Tag.BITFIELD:
        const interested = new Message(Tag.INTERESTED, Buffer.from([]));
        socket.write(Uint8Array.from(interested.encode()));
        break;
      case Tag.REQUEST:
        break;
      case Tag.PIECE:
        const { begin, blockData } = Block.parsePayload(message.payload);

        const targetBlock = this.blocks.find((block) => block.begin === begin);

        if (targetBlock) {
          targetBlock.fill(blockData);
        }

        const nextBlock = this.nextEmptyBlock();

        if (nextBlock) {
          const request = new Message(Tag.REQUEST, nextBlock.encode());

          socket.write(Uint8Array.from(request.encode()));
        }

        break;
      case Tag.CANCEL:
        break;
    }
  }
}
