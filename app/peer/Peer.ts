export class Peer {
  constructor(readonly ip: string, readonly port: number) {}

  static fromString(peerString: string) {
    const ip = peerString.slice(0, peerString.indexOf(":"));
    const port = parseInt(peerString.slice(peerString.indexOf(":") + 1));

    if (!ip || !port) {
      throw new Error("Invalid peer format!");
    }

    return new Peer(ip, port);
  }
}
