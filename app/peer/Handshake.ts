import { ByteIterator } from "../utils";

export class Handshake {
  private length = 19;
  private torrent = "BitTorrent protocol";
  private reserved = Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]);

  private _serialized: Uint8Array | undefined;

  constructor(readonly infoHash: Buffer, readonly peerId: string) {}

  static from(serialized: Buffer): Handshake {
    if (serialized.length !== 68) {
      throw new Error("Bad Handshake format, expected length of 68");
    }

    const iter = new ByteIterator(serialized.toString("latin1"));
    iter.next(20); // protocol
    iter.next(8); // reserved bytes
    const infoHash = iter.next(20);

    if (!infoHash || infoHash.length !== 20) {
      throw new Error("Bad Handshake format, could not parse infoHash");
    }

    const peerId = iter.next(20);

    if (!peerId || peerId.length !== 20) {
      throw new Error("Bad Handshake format, could not parse peerId");
    }

    return new Handshake(
      Buffer.from(infoHash),
      Buffer.from(peerId).toString("latin1")
    );
  }

  serialize(): Uint8Array {
    if (!this._serialized) {
      const totalLength =
        1 + // for the length character 19
        this.torrent.length + // 19
        this.reserved.length + // 8
        this.infoHash.length + // 20
        this.peerId.length; // 20

      const buffer = Buffer.alloc(totalLength);

      buffer.writeUint8(this.length);

      buffer.write(this.torrent, 1, "utf-8");

      this.reserved.forEach((byte, index) => {
        buffer.writeUInt8(byte, 20 + index);
      });

      // @ts-ignore
      this.infoHash.copy(buffer, 28);

      buffer.write(this.peerId, 48, "utf-8");

      this._serialized = Uint8Array.from(buffer);
    }

    return this._serialized;
  }
}
