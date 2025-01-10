import { describe, it, expect, mock } from "bun:test";
import { MessageBuffer } from "./MessageBuffer";

describe("Message Buffer", () => {
  const onComplete = mock();
  const messageBuffer = new MessageBuffer(onComplete);

  it("buffers data until the message is complete", () => {
    messageBuffer.receive(Buffer.from([0, 0, 0, 10, 1, 2]));
    messageBuffer.receive(Buffer.from([3, 4]));
    messageBuffer.receive(Buffer.from([5, 6, 7, 8, 9]));
    messageBuffer.receive(Buffer.from([10, 0, 0, 0, 4, 1, 2]));
    messageBuffer.receive(Buffer.from([3, 4]));

    const firstBuffer = Buffer.from([
      0, 0, 0, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);

    const secondBuffer = Buffer.from([0, 0, 0, 4, 1, 2, 3, 4]);

    const calledFirstBuffer = onComplete.mock.calls[0][0];
    expect([...firstBuffer]).toEqual([...calledFirstBuffer]);

    const calledSecondBuffer = onComplete.mock.calls[1][0];
    expect([...secondBuffer]).toEqual([...calledSecondBuffer]);
  });
});
