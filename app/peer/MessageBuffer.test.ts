import { describe, it, expect, mock } from "bun:test";
import { MessageBuffer } from "./MessageBuffer";
import { Message } from "./Message";

describe("Message Buffer", () => {
  const onComplete = mock();
  const messageBuffer = new MessageBuffer({ onComplete });

  it("buffers data until the message is complete", () => {
    messageBuffer.receive(Buffer.from([0, 0, 0, 10, 1, 2]), {} as any);
    messageBuffer.receive(Buffer.from([3, 4]), {} as any);
    messageBuffer.receive(Buffer.from([5, 6, 7, 8, 9]), {} as any);
    messageBuffer.receive(Buffer.from([10, 0, 0, 0, 4, 1, 2]), {} as any);
    messageBuffer.receive(Buffer.from([3, 4]), {} as any);

    const firstMessage = Message.decode(
      Buffer.from([0, 0, 0, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    );

    const secondBuffer = Message.decode(Buffer.from([0, 0, 0, 4, 1, 2, 3, 4]));

    const calledFirstBuffer = onComplete.mock.calls[0][0];
    expect(firstMessage).toEqual(calledFirstBuffer);

    const calledSecondBuffer = onComplete.mock.calls[1][0];
    expect(secondBuffer).toEqual(calledSecondBuffer);
  });
});
