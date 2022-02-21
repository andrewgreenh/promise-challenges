export function promiseRace<TPromises extends unknown[]>(
  promises: TPromises
): Promise<Awaited<TPromises[number]>> {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      (p as any).then(resolve, reject);
    }
  });
}
