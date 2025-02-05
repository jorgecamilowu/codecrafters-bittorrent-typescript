import type { Socket } from "bun";
import { Message, Tag } from "./Message";
import { Block, BLOCK_SIZE } from "./Block";
import { Piece } from "./Piece";

interface Options {
  onDownloadFinish(piece: Piece, index: number): any;
}

export class PeerMessenger {
  blocks: Record<number, Block>;

  constructor(
    private pieceLength: number,
    private pieceIndex: number,
    private options?: Options
  ) {
    const nBlocks = Math.ceil(this.pieceLength / BLOCK_SIZE);

    this.blocks = Array.from({ length: nBlocks }, (_, index) => {
      const isLastBlock = index === nBlocks - 1;

      const blockLength =
        isLastBlock && this.pieceLength % BLOCK_SIZE !== 0
          ? this.pieceLength % BLOCK_SIZE
          : BLOCK_SIZE;

      return new Block(
        this.pieceIndex,
        index * BLOCK_SIZE,
        blockLength,
        Buffer.alloc(0)
      );
    }).reduce((acc, block) => {
      acc[block.begin] = block;
      return acc;
    }, {} as Record<number, Block>);
  }

  handlePeerMessage(socket: Socket, message: Message) {
    switch (message.tag) {
      case Tag.CHOKE:
        break;
      case Tag.UNCHOKE:
        Object.values(this.blocks).forEach((block) => {
          const request = new Message(Tag.REQUEST, block.encode());

          socket.write(Uint8Array.from(request.encode()));
        });

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
        const { begin, blockData } = Block.parsePiecePayload(message.payload);

        if (this.blocks[begin]) {
          this.blocks[begin].data = blockData;
        }

        // done receiving all blocks
        if (
          Object.values(this.blocks).every((block) => block.data.length !== 0)
        ) {
          this.options?.onDownloadFinish?.(
            Piece.fromBlocks(Object.values(this.blocks)),
            this.pieceIndex
          );
        }

        break;
      case Tag.CANCEL:
        break;
    }
  }
}
