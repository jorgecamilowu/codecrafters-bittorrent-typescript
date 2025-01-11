import { ByteIterator } from "../util";
import { invariant } from "../util/invariant";

export class Handshake {
  private protocolPrefix = 19;
  private protocol = "BitTorrent protocol";
  private reserved = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);

  constructor(readonly infoHash: Buffer, readonly peerId: string) {}

  static from(serialized: Buffer): Handshake {
    invariant(
      serialized.length >= 68,
      "Bad Handshake format, expected min length of 68"
    );

    const iter = new ByteIterator(serialized.toString("latin1"));
    iter.skip(20 + 8); // protocol + reserved bytes
    const infoHash = iter.next(20);

    invariant(
      infoHash !== undefined,
      "Bad Handshake format, could not parse infoHash"
    );
    invariant(
      infoHash.length === 20,
      "Bad Handshake format, could not parse infoHash"
    );

    const peerId = iter.next(20);

    invariant(
      peerId !== undefined,
      "Bad Handshake format, could not parse peerId"
    );
    invariant(
      peerId.length === 20,
      "Bad Handshake format, could not parse peerId"
    );

    return new Handshake(
      Buffer.from(infoHash),
      Buffer.from(peerId).toString("latin1")
    );
  }

  serialize(): Buffer {
    return Buffer.concat([
      Buffer.from([this.protocolPrefix]),
      Buffer.from(this.protocol),
      this.reserved,
      this.infoHash,
      Buffer.from(this.peerId),
    ]);
  }
}
