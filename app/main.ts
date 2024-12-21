// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"

function validateBeencodedInt(beencoded: string): boolean {
  return (
    beencoded.length >= 3 &&
    beencoded[0] === "i" &&
    beencoded[bencodedValue.length - 1] === "e"
  );
}

function decodeBencode(bencodedValue: string): string | number {
  /* This function is used to decode a bencoded string
    The bencoded string is a string that is prefixed by the length of the string
    **/

  // Check if the first character is a digit
  if (!isNaN(parseInt(bencodedValue[0]))) {
    const firstColonIndex = bencodedValue.indexOf(":");
    if (firstColonIndex === -1) {
      throw new Error("Invalid encoded value");
    }
    return bencodedValue.substring(firstColonIndex + 1);
  }

  if (bencodedValue[0] === "i") {
    if (!validateBeencodedInt(bencodedValue)) {
      throw new Error(
        "Invalid beencoded integer format. Should start with 'i' and end with 'e'"
      );
    }

    const output = parseInt(
      bencodedValue.substring(1, bencodedValue.length - 1)
    );

    if (isNaN(output)) {
      throw new Error(
        "Invalid beencoded integer format. Should start with 'i' and end with 'e'"
      );
    }

    return output;
  }

  throw new Error("Unsupported encoded value");
}

const args = process.argv;
const bencodedValue = args[3];

if (args[2] === "decode") {
  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  // Uncomment this block to pass the first stage
  try {
    const decoded = decodeBencode(bencodedValue);
    console.log(JSON.stringify(decoded));
  } catch (error) {
    console.error(error.message);
  }
}
