export interface TrackerResponse {
  complete: number;
  incomplete: number;
  interval: number;
  "min interval": number;
  /** byte sequence in string */
  peers: string;
}
