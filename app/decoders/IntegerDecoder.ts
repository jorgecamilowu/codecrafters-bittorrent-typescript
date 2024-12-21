import type { Decoder } from "./Decoder";

export class IntegerDecoder implements Decoder {
  takeNext(bencodedValue: string): [string, string] {
    const nextEnding = bencodedValue.indexOf("e");

    if (nextEnding === -1) {
      throw new Error(
        "No ending 'e' found for the current integer encoded value",
        {
          cause: {
            bencodedValue,
          },
        }
      );
    }

    return [
      bencodedValue.slice(0, nextEnding + 1),
      bencodedValue.slice(nextEnding + 1),
    ];
  }
  private validateBenecodedValue(bencodedValue: string) {
    return (
      bencodedValue.length >= 2 &&
      bencodedValue[0] === "i" &&
      bencodedValue[bencodedValue.length - 1] === "e"
    );
  }

  decode(bencodedValue: string): number {
    if (!this.validateBenecodedValue(bencodedValue)) {
      throw new Error(
        "Invalid integer encoding format. Integer encoded values should start with 'i' followed by the integer value and end with 'e'",
        {
          cause: {
            bencodedValue,
          },
        }
      );
    }

    const stringInt = bencodedValue.slice(1, bencodedValue.length - 1);

    if (stringInt === "") {
      return 0;
    }

    const output = parseInt(stringInt);

    if (isNaN(output)) {
      throw new Error("Could not parse out value", {
        cause: { bencodedValue: bencodedValue },
      });
    }

    return output;
  }

  match(bencoded: string): boolean {
    return bencoded[0] === "i";
  }
}
