export function invariant(
  condition: unknown,
  error?: string | Error
): asserts condition {
  if (!condition) {
    if (error === undefined) {
      throw new Error("Invariant assertion failure.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(error);
  }
}
