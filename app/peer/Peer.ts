export class Peer {
  readonly ip: string;
  readonly port: number;

  constructor(encoded: string) {
    const ip = encoded.slice(0, encoded.indexOf(":"));
    const port = parseInt(encoded.slice(encoded.indexOf(":") + 1));

    if (!ip || !port) {
      throw new Error("Invalid peer format!");
    }

    this.ip = ip;
    this.port = port;
  }
}
