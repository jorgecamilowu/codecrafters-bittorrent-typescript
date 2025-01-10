import { fetchPeers } from "./trackers/fetchPeers";
import { DictionaryEncoder } from "./torrent/encoders";
import { ByteIterator, toHex } from "./utils";
import { TorrentReader } from "./torrent/reader";
import { toBenecoded } from "./torrent/values";
import { generateRandomId } from "./trackers";
import { Handshake, Peer } from "./peer";
import { Message } from "./peer/Message";
import { Downloader } from "./torrent/download/Downloader";
import { MessageBuffer } from "./torrent/download/MessageBuffer";
import type { Socket } from "bun";

function info(filePath: string) {
  const reader = new TorrentReader();

  const torrent = reader.read(filePath);

  const bencodedInfo = new DictionaryEncoder().encode(torrent.info);

  const infoHash = new Bun.CryptoHasher("sha1")
    .update(bencodedInfo, "binary")
    .digest("hex");

  console.log(`Tracker URL: ${torrent.announce}`);
  console.log(`Length: ${torrent.info.length}`);
  console.log(`Info Hash: ${infoHash}`);
  console.log(`Piece Length: ${torrent.info["piece length"]}`);
  console.log("Piece Hashes:");

  const iter = new ByteIterator(torrent.info.pieces);

  let piece = iter.next(20);
  while (piece) {
    console.log(toHex(piece));

    piece = iter.next(20);
  }
}
const args = process.argv;

if (args[2] === "decode") {
  const bencodedValue = args[3];
  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  try {
    const decoded = toBenecoded(bencodedValue).decoder.decode();

    console.log(JSON.stringify(decoded));
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
} else if (args[2] === "info") {
  const torrentFilePath = args[3];
  info(torrentFilePath);
} else if (args[2] === "peers") {
  const torrentFilePath = args[3];

  const reader = new TorrentReader();

  const torrent = reader.read(torrentFilePath);

  for await (const peer of fetchPeers(torrent)) {
    console.log(`${peer.ip}:${peer.port}`);
  }
} else if (args[2] === "handshake") {
  const torrentPath = args[3];
  const peer = Peer.fromString(args[4]);

  const reader = new TorrentReader();

  const torrent = reader.read(torrentPath);

  const bencoded = new DictionaryEncoder().encode(torrent.info);

  const hashed = new Bun.CryptoHasher("sha1")
    .update(bencoded, "latin1")
    .digest();

  const handshake = new Handshake(hashed, generateRandomId(20)).serialize();

  await Bun.connect({
    hostname: peer.ip,
    port: peer.port,
    socket: {
      open(socket) {
        // initiate handshake
        socket.write(Uint8Array.from(handshake));
      },
      data(_socket, data) {
        try {
          const incomingHandshake = Handshake.from(data);

          console.log(`Peer ID: ${toHex(incomingHandshake.peerId)}`);
        } catch (e) {
          console.error(e);
        }
      },
    },
  });
} else if (args[2] === "download_piece") {
  const output = args[4];
  const torrentPath = args[5];
  const pieceIndex = args[6];

  const reader = new TorrentReader();

  const torrent = reader.read(torrentPath);

  const bencoded = new DictionaryEncoder().encode(torrent.info);

  const hashed = new Bun.CryptoHasher("sha1")
    .update(bencoded, "latin1")
    .digest();

  const handshake = new Handshake(hashed, generateRandomId(20)).serialize();

  const peer = (await fetchPeers(torrent).next()).value as Peer;

  let handshakeDone = false;

  const receiveHandshake = (data: Buffer) => {
    const incomingHandshake = Handshake.from(data);
    console.log(`Peer ID: ${toHex(incomingHandshake.peerId)}`);
    handshakeDone = true;
  };

  const downloader = new Downloader(
    parseInt(pieceIndex),
    torrent.info["piece length"]
  );

  const messageBuffer = new MessageBuffer({
    onComplete: (msg, socket) => {
      downloader.downloadPiece(socket, msg);
    },
  });

  await Bun.connect({
    hostname: peer.ip,
    port: peer.port,
    socket: {
      open(socket) {
        // initiate handshake
        socket.write(Uint8Array.from(handshake));
      },
      data(socket, data) {
        try {
          if (!handshakeDone) {
            receiveHandshake(data);
          } else {
            messageBuffer.receive(data, socket);
          }
        } catch (e) {
          console.error(e);
        }
      },
    },
  });
}
