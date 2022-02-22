export function limitConcurrency<TArgs extends any[], TReturnType>(
  maxConcurrency: number,
  func: (...args: TArgs) => Promise<TReturnType>
): (...args: TArgs) => Promise<TReturnType> {
  let runningRequests = 0;
  const queue: (() => void)[] = [];

  return async function limited(...args: TArgs): Promise<TReturnType> {
    return new Promise<TReturnType>((resolve, reject) => {
      const queueItem = () => {
        runningRequests++;
        func(...args)
          .then(resolve, reject)
          .finally(() => {
            runningRequests--;
            const next = queue.shift();
            if (!next) return;
            next();
          });
      };
      if (runningRequests < maxConcurrency) {
        queueItem();
      } else {
        queue.push(queueItem);
      }
    });
  };
}
