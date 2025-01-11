import { DictionaryEncoder } from "./torrent/encoders";
import { TorrentReader } from "./torrent/reader";
import { toBenecoded } from "./torrent/values";
import { generateRandomId, fetchPeers } from "./tracker";
import { Handshake, Peer, MessageBuffer, Piece, Downloader } from "./peer";
import { ByteIterator, toHex, invariant } from "./util";

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

  const validatePieceHash = (downloadedPiece: Piece) => {
    const pieceHash = new Bun.CryptoHasher("sha1")
      .update(Uint8Array.from(downloadedPiece.data), "binary")
      .digest("hex");

    const expectedPieceHash = new ByteIterator(torrent.info.pieces)
      .skip(parseInt(pieceIndex) * 20)
      .next(20);

    invariant(expectedPieceHash !== undefined, "Piece hash not found");
    invariant(pieceHash === toHex(expectedPieceHash), "Piece hash mismatch");
  };

  const downloader = new Downloader(
    torrent.info.length,
    torrent.info["piece length"],
    parseInt(pieceIndex),
    {
      onDownloadFinish: async (piece) => {
        validatePieceHash(piece);

        await Bun.write(output, Uint8Array.from(piece.data));

        console.log(`Piece downloaded to ${output}`);
      },
    }
  );

  const messageBuffer = new MessageBuffer({
    onComplete: (msg, socket) => {
      downloader.downloadPiece(socket, msg);
    },
  });

  Bun.connect({
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
      close() {
        console.log("Socket was closed");
      },
      error(_socket, error) {
        console.error(error);
      },
    },
  });
}
