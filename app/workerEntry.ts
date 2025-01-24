import type { Socket } from "bun";
import { Peer, Piece, Handshake, PeerMessenger, MessageBuffer } from "./peer";
import { DictionaryEncoder } from "./torrent/encoders";
import type { TorrentMeta } from "./torrent/TorrentMeta";
import { generateRandomId, invariant, toHex } from "./util";

declare var self: Worker;

interface WorkerFailure {
  status: "failed";
  pieceIndex: number;
}

interface WorkerSuccess {
  status: "downloaded";
  piece: Piece;
  pieceIndex: number;
}

export interface WorkerMessage {
  torrent: TorrentMeta;
  peer: Peer;
  pieceIndex: number;
  pieceLength: number;
}

export type WorkerResult = WorkerFailure | WorkerSuccess;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  downloadPiece(event.data);
};

async function downloadPiece({
  peer,
  pieceIndex,
  pieceLength,
  torrent,
}: WorkerMessage) {
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
  let downloadCompleted = false;

  const peerMessenger = new PeerMessenger(pieceLength, pieceIndex, {
    onDownloadFinish: (piece, pieceIndex) => {
      const result: WorkerResult = {
        status: "downloaded",
        piece,
        pieceIndex,
      };

      postMessage(result);

      downloadCompleted = true;

      socketRef.end();
    },
  });

  const messageBuffer = new MessageBuffer({
    onComplete: (msg) => {
      peerMessenger.handlePeerMessage(socketRef, msg);
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
        if (!downloadCompleted) {
          console.log("Peer closed connection before download completed");

          const result: WorkerResult = {
            status: "failed",
            pieceIndex,
          };

          postMessage(result);
        }
      },
      error(_socket, error) {
        console.error(error);
      },
    },
  });
}
