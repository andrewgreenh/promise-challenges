import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { sleep } from "../01-sleep/sleep";
import { flushPromises } from "../utils/flushPromises";
import { promiseMap } from "./promiseMap";

describe("promiseMap", () => {
  const resultHandler = vi.fn();
  beforeEach(() => {
    resultHandler.mockClear();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should map correctly", async () => {
    promiseMap(1, [1, 2, 3], (i) => Promise.resolve(i ** 2)).then(
      resultHandler
    );

    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([1, 4, 9]);
  });

  it("should call mapper with correct arguments", async () => {
    const mapper = vi.fn((item: number, index: number, items: number[]) =>
      Promise.resolve(item ** 2)
    );

    const items = [1, 2, 3];

    promiseMap(1, items, mapper);

    await flushPromises();

    expect(mapper).toHaveBeenNthCalledWith(1, 1, 0, items);
    expect(mapper).toHaveBeenNthCalledWith(2, 2, 1, items);
    expect(mapper).toHaveBeenNthCalledWith(3, 3, 2, items);
  });

  it("should stay within concurrency limit 1", async () => {
    const square = vi.fn(async (num: number) => {
      await sleep(1000);
      return num ** 2;
    });

    promiseMap(1, [1, 2, 3], square).then(resultHandler);

    expect(square).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(square).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(square).toHaveBeenCalledTimes(3);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(resultHandler).toHaveBeenCalledWith([1, 4, 9]);
  });

  it("should stay within concurrency limit 2", async () => {
    const square = vi.fn(async (num: number) => {
      await sleep(1000);
      return num ** 2;
    });

    promiseMap(2, [1, 2, 3, 4, 5], square).then(resultHandler);

    expect(square).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(square).toHaveBeenCalledTimes(4);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(square).toHaveBeenCalledTimes(5);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(resultHandler).toHaveBeenCalledWith([1, 4, 9, 16, 25]);
  });

  it("should not introduce additional waiting times", async () => {
    const square = vi.fn(async (num: number, index: number) => {
      if (index === 0) await sleep(5000);
      else await sleep(1000);
      return num ** 2;
    });
    const items = [1, 2, 3, 4, 5];

    promiseMap(2, items, square).then(resultHandler);

    // First to indices should be called sync.
    expect(square).toHaveBeenCalledTimes(2);
    expect(square).toHaveBeenCalledWith(1, 0, items);
    expect(square).toHaveBeenCalledWith(2, 1, items);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    // Index 1 should be finished by now, Index 0 is still running 4 more seconds
    // But index 2 should now be called already to stay at concurrency 2
    expect(square).toHaveBeenCalledTimes(3);
    expect(square).toHaveBeenCalledWith(3, 2, items);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    // Index 2 should be finished by now, Index 0 is still running 3 more seconds
    // But index 3 should now be called already to stay at concurrency 2
    expect(square).toHaveBeenCalledTimes(4);
    expect(square).toHaveBeenCalledWith(4, 3, items);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    // Index 3 should be finished by now, Index 0 is still running 2 more seconds
    // But index 4 should now be called already to stay at concurrency 2
    expect(square).toHaveBeenCalledTimes(5);
    expect(square).toHaveBeenCalledWith(5, 4, items);

    vi.advanceTimersByTime(2000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([1, 4, 9, 16, 25]);
  });
});
