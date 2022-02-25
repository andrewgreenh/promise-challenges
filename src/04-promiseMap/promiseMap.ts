/**
 * Like `array.map` but with async callbacks. Additionally you have to supply a maxConcurrency. The implementation has to make sure that the callback is not running more than `maxConcurrency` instances at the same time.
 *
 * Example usage:
 *
 * ```ts
 * async function main() {
 *   // Max concurrency 1
 *   // --> The next call waits for the previous one to finish
 *   //     They are called in serial.
 *   const result = await promiseMap(1, [1, 2, 3], async (i) => {
 *     await sleep(1000);
 *     return i * 2;
 *   });
 *
 *   // Should log [2, 4, 6] after 3 seconds
 *   console.log(result);
 *
 *   // Max concurrency 10
 *   // --> All calls happen at the same time and are run in parallel
 *   const result = await promiseMap(10, [1, 2, 3], async (i) => {
 *     await sleep(1000);
 *     return i * 2;
 *   });
 *
 *   // Should log [2, 4, 6] after 1 second
 *   console.log(result);
 * }
 * ```
 *
 * @param maxConcurrency maximum count of concurrent invokes of the callback
 * @param items list of items
 * @param callback async function that is called for each item of the list
 * @returns Promise of the list of transformed items
 */
export function promiseMap<TItem, TOutput>(
  maxConcurrency: number,
  items: TItem[],
  callback: (item: TItem, index: number, items: TItem[]) => Promise<TOutput>
): Promise<TOutput[]> {
  return new Promise((resolve, reject) => {
    const queue = items.map((item, index) => ({ item, index }));
    const initialChunk = queue.slice(0, maxConcurrency);
    const remainingItems = queue.slice(maxConcurrency);
    const results: TOutput[] = [];

    function pull({ item, index }: typeof initialChunk[number]) {
      callback(item, index, items).then(
        (result) => {
          results[index] = result;
          const next = remainingItems.shift();
          if (!next) resolve(results);
          else pull(next);
        },
        (err) => {
          reject(err);
        }
      );
    }

    for (const element of initialChunk) pull(element);
  });
}
