export function promiseHandle<TValue>(): {
  promise: Promise<TValue>;
  resolve: (value: TValue | PromiseLike<TValue>) => void;
  reject: (reason?: any) => void;
} {
  let resolve: (value: TValue | PromiseLike<TValue>) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<TValue>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
