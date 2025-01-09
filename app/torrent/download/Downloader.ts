import type { Socket } from "bun";
import { Message, Tag } from "../../peer/Message";

export class Downloader {
  downloadPiece(socket: Socket, message: Message) {
    switch (message.tag) {
      case Tag.CHOKE:
        break;
      case Tag.UNCHOKE:
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
        break;
      case Tag.CANCEL:
        break;
    }
  }
}
