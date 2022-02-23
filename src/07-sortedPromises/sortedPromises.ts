import { promiseHandle } from "../06-promiseHandle/promiseHandle";

export function sortedPromises<TValue>(
  promises: Promise<TValue>[]
): AsyncIterableIterator<TValue> {
  let handle = promiseHandle<TValue>();
  let toYield = [handle];
  let yielded = 0;

  for (const p of promises) {
    p.then(
      (x) => {
        handle.resolve(x);
        handle = promiseHandle();
        toYield.push(handle);
      },
      (x) => {
        handle.reject(x);
        handle = promiseHandle();
        toYield.push(handle);
      }
    );
  }

  async function* generator() {
    while (yielded < promises.length) {
      yield toYield.shift()!.promise;
      yielded++;
    }
  }

  return generator();
}
