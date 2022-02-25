/**
 * Manual implementation of `Promise.all`,
 * without directly using `Promise.all`.
 * `promiseAll` gets passed a list of promises and returns
 * a new promise that settles with the list of all resolved
 * values from the given list.
 *
 * Example usage:
 *
 * ```ts
 * async function main() {
 *   const result = await promiseAll([
 *     sleep(1000).then(() => 2),
 *     sleep(2000).then(() => 3),
 *     sleep(500).then(() => 1),
 *   ]);
 *
 *   // Should log [2, 3, 1]
 *   console.log(result);
 * }
 * ```
 *
 * @param promises list of promises
 * @returns promise that resolves with the list of all values resolved from `promises`
 */
export function promiseAll<T extends readonly unknown[] | []>(
  promises: T
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return new Promise((resolve, reject) => {
    const results: any = [];
    let resolvedCount = 0;
    if (resolvedCount === promises.length) resolve(results);

    for (let i = 0; i < promises.length; i++) {
      const promise: any = promises[i];
      promise.then(
        (result: any) => {
          results[i] = result;
          resolvedCount++;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        },
        (error: any) => {
          reject(error);
        }
      );
    }
  });
}
