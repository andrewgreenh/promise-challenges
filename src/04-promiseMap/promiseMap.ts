export function promiseMap<TItem, TOutput>(
  maxConcurrency: number,
  items: TItem[],
  map: (item: TItem, index: number, items: TItem[]) => Promise<TOutput>
): Promise<TOutput[]> {
  return new Promise((resolve, reject) => {
    const queue = items.map((item, index) => ({ item, index }));
    const initialChunk = queue.slice(0, maxConcurrency);
    const remainingItems = queue.slice(maxConcurrency);
    const results: TOutput[] = [];

    function pull({ item, index }: typeof initialChunk[number]) {
      map(item, index, items).then((result) => {
        results[index] = result;
        const next = remainingItems.shift();
        if (!next) resolve(results);
        else pull(next);
      });
    }

    for (const element of initialChunk) pull(element);
  });
}
