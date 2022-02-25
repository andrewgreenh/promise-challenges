/**
 * Creates a promise that can be resolved or rejected from the outside.
 *
 * Example usage:
 *
 * ```ts
 * async function main() {
 *   const handle = promiseHandle<number>();
 *
 *   const { resolve, reject, promise } = handle;
 *
 *   setTimeout(() => {
 *     resolve(10);
 *   }, 10000);
 *
 *   const result = await promise;
 *
 *   // Should log 10 after 10 seconds
 *   console.log(result);
 * }
 * ```
 * @returns
 */
export function promiseHandle<TValue>(): {
  promise: Promise<TValue>;
  resolve: (value: TValue | PromiseLike<TValue>) => void;
  reject: (reason?: any) => void;
} {
  throw new Error("Not implemented yet");
}
