export type TorrentMeta = {
  announce: string;
  info: {
    length: number;
    ["piece length"]: number;
    pieces: string;
  };
};
