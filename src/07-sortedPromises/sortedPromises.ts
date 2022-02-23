import { promiseHandle } from "../06-promiseHandle/promiseHandle";

export function sortedPromises<TValue>(
  promises: Promise<TValue>[]
): AsyncIterableIterator<TValue> {
  let handle = promiseHandle<TValue>();
  let toYield = [handle.promise];
  let yielded = 0;

  for (const p of promises) {
    p.then(
      (x) => {
        handle.resolve(x);
        handle = promiseHandle();
        toYield.push(handle.promise);
      },
      (x) => {
        handle.reject(x);
        handle = promiseHandle();
        toYield.push(handle.promise);
      }
    );
  }

  async function* generator() {
    while (yielded < promises.length) {
      yield toYield.shift()!;
      yielded++;
    }
  }

  return generator();
}
