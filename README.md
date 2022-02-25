# Promise Challenges

This repository contains a set of challenges around promises. I hope it will help you better understand async operations and building bridges between the callback style world and promises.

## TLDR

Run

```sh
yarn
yarn test
```

And make all tests green.

## How to run

Clone the `main` branch of this repository and install dependencies with `yarn`.
Each challenge consists of implementing one function where the signature is already present within `src/0N` folders. Each of those functions also has a couple of tests for various edge cases. The tests are written with [vitest](https://vitest.dev/).

To run all tests, run `yarn test` but you can also run tests for a specific challenge by running `yarn test 01` for all test cases for challenge 01-sleep.

## Solutions

If you get stuck, feel free to peak at the solutions on the [solution branch](https://github.com/andrewgreenh/promise-challenges/tree/solutions)

## The challenges

### 01-sleep

A simple function that introduces a delay in an async function.

Example usage:

```ts
async function main() {
  console.log("hi!");
  await sleep(1000);
  console.log("after 1 second");
}
```

### 02-promiseRace

Hand roll your own `Promise.race` function, without directly using `Promise.race`.
`promiseRace` gets passed a list of promises and returns a new promise that settles with the same value as the fastes promise in the given list.

Example usage:

```ts
async function main() {
  const result = await promiseRace([
    sleep(1000).then(() => 2),
    sleep(2000).then(() => 3),
    sleep(500).then(() => 1),
  ]);

  // Should log 1
  console.log(result);
}
```

### 03-promiseAll

Similar to the previous task: Hand roll your own `Promise.all` function, without directly using `Promise.all`.
`promiseAll` gets passed a list of promises and returns a new promise that settles with the list of all resolved values from the given list.

Example usage:

```ts
async function main() {
  const result = await promiseAll([
    sleep(1000).then(() => 2),
    sleep(2000).then(() => 3),
    sleep(500).then(() => 1),
  ]);

  // Should log [2, 3, 1]
  console.log(result);
}
```

### 04-promiseMap

Like `array.map` but with async callbacks. Additionally you have to supply a maxConcurrency. The implementation has to make sure that the callback is not running more than `maxConcurrency` instances at the same time.

Example usage:

```ts
async function main() {
  // Max concurrency 1
  // --> The next call waits for the previous one to finish
  //     They are called in serial.
  const result = await promiseMap(1, [1, 2, 3], async (i) => {
    await sleep(1000);
    return i * 2;
  });

  // Should log [2, 4, 6] after 3 seconds
  console.log(result);

  // Max concurrency 10
  // --> All calls happen at the same time and are run in parallel
  const result = await promiseMap(10, [1, 2, 3], async (i) => {
    await sleep(1000);
    return i * 2;
  });

  // Should log [2, 4, 6] after 1 second
  console.log(result);
}
```

### 05-limitConcurrency

Wrap any given function `A` and return a version of that function that will queue up additional calls of the limited function to make sure only `maxConcurrency` instances of `A` are running at the same time.

Example usage:

```ts
async function main() {
  async function loadData(i: number) {
    await sleep(1000);
    return i;
  }

  const limited = limitConcurrency(1, loadData);

  /**
   * Even if limited is called 4 times in parallel,
   * loadData is only called in serial.
   */
  const results = await Promise.all([
    limited(1),
    limited(2),
    limited(3),
    limited(4),
  ]);

  /**
   * Should log [1, 2, 3, 4] after 4 seconds
   */
  console.log(results);
}
```

### 06-promiseHandle

Creates a promise that can be resolved or rejected from the outside.

Example usage:

```ts
async function main() {
  const handle = promiseHandle<number>();

  const { resolve, reject, promise } = handle;

  setTimeout(() => {
    resolve(10);
  }, 10000);

  const result = await promise;

  // Should log 10 after 10 seconds
  console.log(result);
}
```

### 07-sortedPromises

Create an [asyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) that yields promises in the order of their resolve events.

Example usage:

```ts
const sorted = sortedPromises([
  sleep(5000).then(() => 3),
  sleep(4000).then(() => 2),
  sleep(1000).then(() => 1),
]);

for await (const value of sorted) {
  // Should log 1, then 2, then 3
  console.log(value);
}
```
