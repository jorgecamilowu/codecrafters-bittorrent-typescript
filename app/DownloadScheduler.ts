import type { Peer } from "./peer";
import type { TorrentMeta } from "./torrent/TorrentMeta";
import { invariant } from "./util";
import type { WorkerMessage } from "./workerEntry";
export interface DownloadTask {
  pieceIndex: number;
  pieceLength: number;
}

export class DownloadScheduler {
  private workers: Map<Peer, Worker>;
  private idlePeers: Peer[];
  private tasks: DownloadTask[];

  constructor(
    readonly peers: Peer[],
    readonly onTaskComplete: (payload: any) => Promise<void>,
    readonly torrent: TorrentMeta
  ) {
    this.workers = new Map(
      peers.map((peer) => {
        const worker = new Worker("./app/workerEntry.ts");
        worker.onmessage = (message) => {
          this.idlePeers.push(peer);
          this.onTaskComplete(message.data).then(() => {
            this.handleNextTask();
          });
        };

        return [peer, worker];
      })
    );

    this.idlePeers = Array.from(this.workers.keys());

    this.tasks = [];
  }

  private handleNextTask() {
    if (this.tasks.length === 0 || this.idlePeers.length === 0) {
      return;
    }

    const task = this.tasks.shift();

    const peer = this.idlePeers.shift();

    invariant(
      task !== undefined && peer !== undefined,
      "Task and Peer should exist"
    );

    const worker = this.workers.get(peer);

    invariant(worker !== undefined, "Worker should exist");

    const message: WorkerMessage = {
      ...task,
      peer,
      torrent: this.torrent,
    };

    worker.postMessage(message);

    this.handleNextTask();
  }

  public download(task: DownloadTask) {
    this.tasks.push(task);
    this.handleNextTask();
  }

  public terminate() {
    for (const worker of this.workers.values()) {
      worker.terminate();
    }
  }
}
