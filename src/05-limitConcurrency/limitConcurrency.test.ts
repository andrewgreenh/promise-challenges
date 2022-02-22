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
import { limitConcurrency } from "./limitConcurrency";

describe("limitConcurrency", () => {
  const resultHandler = vi.fn();
  const failHandler = vi.fn();
  const handlers = [resultHandler, failHandler] as const;

  beforeEach(() => {
    resultHandler.mockClear();
    failHandler.mockClear();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should not destroy the original functionality of the function", async () => {
    const func = vi.fn((i: number) => Promise.resolve(i + 1));
    const limited = limitConcurrency(1, func);

    limited(10).then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    expect(func).toHaveBeenCalledWith(10);
    expect(resultHandler).toHaveBeenCalledWith(11);
  });

  it("should stay below max concurrency 1", async () => {
    const func = vi.fn(async (i: number) => {
      await sleep(1000);
      return i + 1;
    });
    const limited = limitConcurrency(1, func);

    limited(1).then(...handlers);
    limited(2).then(...handlers);
    limited(3).then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenLastCalledWith(1);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenLastCalledWith(2);
    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenLastCalledWith(2);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenLastCalledWith(3);
    expect(func).toHaveBeenCalledTimes(3);
    expect(func).toHaveBeenLastCalledWith(3);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenLastCalledWith(4);
  });

  it("should stay below max concurrency 2", async () => {
    const func = vi.fn(async (i: number) => {
      await sleep(1000);
      return i + 1;
    });
    const limited = limitConcurrency(2, func);

    limited(1).then(...handlers);
    limited(2).then(...handlers);
    limited(3).then(...handlers);
    limited(4).then(...handlers);
    limited(5).then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    expect(func).toHaveBeenCalledWith(1);
    expect(func).toHaveBeenCalledWith(2);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith(2);
    expect(resultHandler).toHaveBeenCalledWith(3);

    expect(func).toHaveBeenCalledWith(3);
    expect(func).toHaveBeenCalledWith(4);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith(4);
    expect(resultHandler).toHaveBeenCalledWith(5);

    expect(func).toHaveBeenCalledWith(5);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith(6);
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should not introduce additional waiting time", async () => {
    let callIndex = 0;
    const func = vi.fn(async (i: number) => {
      if (callIndex++ === 0) await sleep(5000);
      else await sleep(1000);
      return i * -1;
    });
    const limited = limitConcurrency(2, func);

    limited(1).then(...handlers);
    limited(2).then(...handlers);
    limited(3).then(...handlers);
    limited(4).then(...handlers);
    limited(5).then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    // first to calls should have started
    // first call takes 5 seconds
    // second call takes 1 second
    expect(func).toHaveBeenCalledWith(1);
    expect(func).toHaveBeenCalledWith(2);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    // first call is not finished yet (4 seconds to go).
    // second call is finished
    expect(resultHandler).toHaveBeenNthCalledWith(1, -2);

    // third call should be started
    expect(func).toHaveBeenNthCalledWith(3, 3);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    // first call is not finished yet (3 seconds to go).
    // third call is finished
    expect(resultHandler).toHaveBeenNthCalledWith(2, -3);

    // fourth call should be started
    expect(func).toHaveBeenNthCalledWith(4, 4);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    // first call is not finished yet (2 seconds to go).
    // fourth call is finished
    expect(resultHandler).toHaveBeenNthCalledWith(3, -4);

    // fifth call should be started
    expect(func).toHaveBeenNthCalledWith(5, 5);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    // first call is not finished yet (2 seconds to go).
    // fifth call is finished
    expect(resultHandler).toHaveBeenNthCalledWith(4, -5);

    vi.advanceTimersByTime(2000);
    await flushPromises();

    expect(resultHandler).toHaveBeenNthCalledWith(5, -1);
    expect(resultHandler).toHaveBeenCalledTimes(5);
    expect(failHandler).not.toHaveBeenCalled();
  }, 10000);

  it("should propagate errors while not stopping other running instances", async () => {
    let callIndex = 0;
    const func = vi.fn(async (i: number) => {
      if (callIndex++ === 0) {
        await sleep(5000);
        throw new Error("Boom!");
      } else await sleep(1000);
      return i * -1;
    });
    const limited = limitConcurrency(2, func);

    limited(1).then(...handlers);
    limited(2).then(...handlers);
    limited(3).then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();
    expect(resultHandler).not.toHaveBeenCalled();

    expect(func).toHaveBeenNthCalledWith(1, 1);
    expect(func).toHaveBeenNthCalledWith(2, 2);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenNthCalledWith(1, -2);
    expect(failHandler).not.toHaveBeenCalled();
    expect(func).toHaveBeenNthCalledWith(3, 3);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenNthCalledWith(2, -3);
    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledTimes(2);
    expect(failHandler).toHaveBeenCalledOnce();
    expect(failHandler).nthCalledWith(1, new Error("Boom!"));
  }, 10000);
});
