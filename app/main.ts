import { DictionaryEncoder } from "./torrent/encoders";
import { TorrentReader } from "./torrent/reader";
import { toBenecoded } from "./torrent/values";
import { generateRandomId, fetchPeers } from "./tracker";
import { Handshake, Peer, MessageBuffer, Piece, Downloader } from "./peer";
import { ByteIterator, toHex, invariant } from "./util";
import type { Socket } from "bun";
import type { TorrentMeta } from "./torrent/TorrentMeta";
import { DownloadPool } from "./DownloadScheduler";
import type { WorkerResult } from "./workerEntry";

const args = process.argv;

async function downloadPiece(
  torrent: TorrentMeta,
  peer: Peer,
  pieceIndex: number,
  pieceLength: number,
  onDownloadPieceComplete: (
    piece: Piece,
    pieceIndex: number,
    peer: Peer
  ) => Promise<void>
) {
  const bencoded = new DictionaryEncoder().encode(torrent.info);

  const hashed = new Bun.CryptoHasher("sha1")
    .update(bencoded, "latin1")
    .digest();

  const handshake = new Handshake(hashed, generateRandomId(20)).serialize();

  let handshakeDone = false;

  const receiveHandshake = (data: Buffer) => {
    const incomingHandshake = Handshake.from(data);
    console.log(`Peer ID: ${toHex(incomingHandshake.peerId)}`);
    handshakeDone = true;
  };

  let socketRef: Socket;

  const downloader = new Downloader(pieceLength, pieceIndex, {
    onDownloadFinish: (piece, pieceIndex) => {
      onDownloadPieceComplete(piece, pieceIndex, peer);
      socketRef.end();
    },
  });

  const messageBuffer = new MessageBuffer({
    onComplete: (msg) => {
      downloader.handlePeerMessage(socketRef, msg);
    },
  });

  Bun.connect({
    hostname: peer.ip,
    port: peer.port,
    socket: {
      open(socket) {
        socketRef = socket;
        // initiate handshake
        socket.write(Uint8Array.from(handshake));
      },
      data(_socket, data) {
        try {
          if (!handshakeDone) {
            receiveHandshake(data);
          } else {
            messageBuffer.receive(data);
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

  const reader = new TorrentReader();

  const torrent = reader.read(torrentFilePath);

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
  const pieceIndex = parseInt(args[6]);

  const reader = new TorrentReader();

  const torrent = reader.read(torrentPath);

  const nPieces = Math.ceil(torrent.info.length / torrent.info["piece length"]);

  const isLastPiece = pieceIndex === nPieces - 1;
  const currentPieceLength = isLastPiece
    ? torrent.info.length % torrent.info["piece length"]
    : torrent.info["piece length"];

  const peer = (await fetchPeers(torrent).next()).value as Peer;

  const validatePieceHash = (downloadedPiece: Piece) => {
    const pieceHash = new Bun.CryptoHasher("sha1")
      .update(Uint8Array.from(downloadedPiece.data), "binary")
      .digest("hex");

    const expectedPieceHash = new ByteIterator(torrent.info.pieces)
      .skip(pieceIndex * 20)
      .next(20);

    invariant(expectedPieceHash !== undefined, "Piece hash not found");
    invariant(pieceHash === toHex(expectedPieceHash), "Piece hash mismatch");
  };

  const handleDownload = async (piece: Piece): Promise<void> => {
    validatePieceHash(piece);

    await Bun.write(output, Uint8Array.from(piece.data));

    console.log(`Piece downloaded to ${output}`);
  };

  await downloadPiece(
    torrent,
    peer,
    pieceIndex,
    currentPieceLength,
    handleDownload
  );
} else if (args[2] === "download") {
  const output = args[4];
  const torrentPath = args[5];

  const reader = new TorrentReader();

  const torrent = reader.read(torrentPath);

  const nPieces = Math.ceil(torrent.info.length / torrent.info["piece length"]);

  const completedPieces = new Array(nPieces).fill(false);

  const peers: Peer[] = [];

  for await (const peer of fetchPeers(torrent)) {
    peers.push(peer);
  }

  let tasks: {
    pieceIndex: number;
    pieceLength: number;
  }[] = [];

  for (let i = 0; i < nPieces; i++) {
    const isLastPiece = i === nPieces - 1;
    const currentPieceLength = isLastPiece
      ? torrent.info.length % torrent.info["piece length"]
      : torrent.info["piece length"];

    tasks.push({
      pieceIndex: i,
      pieceLength: currentPieceLength,
    });
  }
  console.log(`number of tasks: ${tasks.length}`);

  const handleDownloadFileFinish = async () => {
    const outputFile = Bun.file(output);
    const writer = outputFile.writer();

    for (let i = 0; i < nPieces; i++) {
      const pieceData = await Bun.file(`/tmp/piece-${i}`).arrayBuffer();

      writer.write(pieceData);
    }

    console.log(`File downloaded to ${output}`);
    downloadPool.terminate();
  };

  const handleDownloadPieceFinish = async (
    result: WorkerResult
  ): Promise<void> => {
    if (result.status === "downloaded") {
      const { piece, pieceIndex } = result;
      await Bun.write(
        `/tmp/piece-${result.pieceIndex}`,
        Uint8Array.from(piece.data)
      );

      console.log(`Piece ${result.pieceIndex} downloaded`);

      completedPieces[pieceIndex] = true;

      if (completedPieces.every((completed) => completed)) {
        handleDownloadFileFinish();
      }
    } else {
      // re-attempt download
      console.log(`Re-attempting to download piece ${result.pieceIndex}`);

      downloadPool.download({
        pieceIndex: result.pieceIndex,
        pieceLength: torrent.info["piece length"],
      });
    }
  };

  const downloadPool = new DownloadPool(
    peers,
    handleDownloadPieceFinish,
    torrent
  );

  tasks.forEach((task) => {
    downloadPool.download(task);
  });
}
