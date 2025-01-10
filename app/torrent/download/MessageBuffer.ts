import type { Socket } from "bun";
import { Message } from "../../peer/Message";

export class MessageBuffer {
  private bufferedData: Buffer;
  private cursor: number;
  private length: number;

  constructor(private onComplete: (message: Message, socket: Socket) => any) {
    this.bufferedData = Buffer.alloc(0);
    this.cursor = 0;
    this.length = 0;
  }

  private flush(socket: Socket) {
    this.onComplete(Message.decode(this.bufferedData), socket);

    this.length = 0;
    this.cursor = 0;
    this.bufferedData = Buffer.alloc(0);
  }

  receive(data: Buffer, socket: Socket) {
    // finished buffering data for the current message
    if (this.cursor === this.length && this.length !== 0) {
      this.flush(socket);
    }

    // Receiving the start of a new message
    if (this.length === 0) {
      // the length prefix is encoded in four bytes big endian
      this.length = data.readUint32BE(0) + 4;
    }

    if (this.cursor + data.length > this.length && this.length !== 0) {
      const remainingPortion = this.length - this.cursor;

      this.receive(data.subarray(0, remainingPortion), socket);
      this.receive(data.subarray(remainingPortion), socket);

      return;
    }

    this.bufferedData = Buffer.concat([this.bufferedData, data]);
    this.cursor += data.length;

    if (this.cursor === this.length) {
      this.flush(socket);
    }
  }
}
