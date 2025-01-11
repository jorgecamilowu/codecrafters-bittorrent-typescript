import { invariant } from "../util";

export enum Tag {
  CHOKE,
  UNCHOKE,
  INTERESTED,
  NOT_INTERESTED,
  HAVE,
  BITFIELD,
  REQUEST,
  PIECE,
  CANCEL,
}

export class Message {
  readonly length: number;

  constructor(readonly tag: Tag, readonly payload: Buffer) {
    this.length = 1 + this.payload.length;
  }

  static decode(bytes: Buffer): Message {
    invariant(bytes.length >= 5, "Invalid peer message length");

    const tag = bytes[4];
    const payload = bytes.subarray(5);

    invariant(
      Object.values(Tag).includes(tag),
      `Unsupported message tag ${tag}`
    );

    return new Message(tag, payload);
  }

  encode(): Buffer {
    // the length prefix is a four byte big endian encoded number
    const encodedLength = Buffer.alloc(4);
    encodedLength.writeUInt32BE(this.length);

    return Buffer.from([...encodedLength, this.tag, ...this.payload]);
  }
}
