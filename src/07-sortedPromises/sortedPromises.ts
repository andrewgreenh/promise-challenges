/**
 * Creates an [asyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator)
 * that yields promises in the order of their resolve events.
 *
 * Example usage:
 *
 * ```ts
 * const sorted = sortedPromises([
 *   sleep(5000).then(() => 3),
 *   sleep(4000).then(() => 2),
 *   sleep(1000).then(() => 1),
 * ]);
 *
 * for await (const value of sorted) {
 *   // Should log 1, then 2, then 3
 *   console.log(value);
 * }
 * ```
 * @param promises
 * @returns an async iterable with the values sorted by resolve event times
 */
export function sortedPromises<TValue>(
  promises: Promise<TValue>[]
): AsyncIterable<TValue> {
  throw new Error("Not implemented yet");

  return {
    async *[Symbol.asyncIterator]() {
      throw new Error("Not implemented yet");
    },
  };
}
