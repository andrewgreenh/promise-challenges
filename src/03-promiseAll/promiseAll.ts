export function promiseAll<T extends readonly unknown[] | []>(
  values: T
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return new Promise((resolve, reject) => {
    const results: any = [];
    let resolvedCount = 0;
    if (resolvedCount === values.length) resolve(results);

    for (let i = 0; i < values.length; i++) {
      const promise: any = values[i];
      promise.then(
        (result: any) => {
          results[i] = result;
          resolvedCount++;
          if (resolvedCount === values.length) {
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
