import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../utils/flushPromises";
import { resolveAfter } from "../utils/resolveAfter";
import { sortedPromises } from "./sortedPromises";

describe("sortedPromises", () => {
  const resultHandler = vi.fn();
  const failHandler = vi.fn();
  const handlers = [resultHandler, failHandler] as const;

  beforeEach(() => {
    vi.useFakeTimers();
    resultHandler.mockClear();
    failHandler.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should work in a for await of loop", async () => {
    vi.useRealTimers();

    for await (const result of sortedPromises([
      resolveAfter(30, 3).catch(failHandler),
      resolveAfter(20, 2).catch(failHandler),
      resolveAfter(10, 1).catch(failHandler),
    ])) {
      resultHandler(result);
    }

    expect(failHandler).not.toHaveBeenCalled();

    expect(resultHandler).nthCalledWith(1, 1);
    expect(resultHandler).nthCalledWith(2, 2);
    expect(resultHandler).nthCalledWith(3, 3);
  });

  it("should directly be done when passed no promises", async () => {
    const iterable = sortedPromises([]);
    const iterator = iterable[Symbol.asyncIterator]();

    iterator.next().then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();
    expect(resultHandler).toHaveBeenCalledWith({
      done: true,
      value: undefined,
    });
  });

  it("should yield promises in order of resolves", async () => {
    const iterable = sortedPromises([
      resolveAfter(3000, 3).catch(failHandler),
      resolveAfter(2000, 2).catch(failHandler),
      resolveAfter(1000, 1).catch(failHandler),
    ]);
    const iterator = iterable[Symbol.asyncIterator]();

    iterator.next().then(...handlers);

    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();
    expect(resultHandler).toHaveBeenCalledTimes(1);
    expect(resultHandler).nthCalledWith(1, { done: false, value: 1 });

    iterator.next().then(...handlers);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledTimes(2);
    expect(resultHandler).nthCalledWith(2, { done: false, value: 2 });

    iterator.next().then(...handlers);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledTimes(3);
    expect(resultHandler).nthCalledWith(3, { done: false, value: 3 });

    iterator.next().then(...handlers);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    expect(resultHandler).toHaveBeenCalledTimes(4);
    expect(resultHandler).nthCalledWith(4, { done: true, value: undefined });
  });

  it("should yield correct promises even when pulling too fast", async () => {
    const iterable = sortedPromises([
      resolveAfter(2000, 2).catch(failHandler),
      resolveAfter(1000, 1).catch(failHandler),
    ]);
    const iterator = iterable[Symbol.asyncIterator]();

    iterator.next().then(...handlers);
    iterator.next().then(...handlers);

    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledOnce();
    expect(resultHandler).nthCalledWith(1, { done: false, value: 1 });

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(failHandler).not.toHaveBeenCalled();

    expect(resultHandler).toHaveBeenCalledTimes(2);
    expect(resultHandler).nthCalledWith(2, { done: false, value: 2 });
  });

  it("should maintain order even when pulling after all promises resolved", async () => {
    const iterable = sortedPromises([
      resolveAfter(2000, 2).catch(failHandler),
      resolveAfter(1000, 1).catch(failHandler),
    ]);
    const iterator = iterable[Symbol.asyncIterator]();
    await flushPromises();

    vi.advanceTimersByTime(1000);
    await flushPromises();
    vi.advanceTimersByTime(1000);
    await flushPromises();

    iterator.next().then(...handlers);
    await flushPromises();
    expect(resultHandler).toHaveBeenCalledTimes(1);
    expect(resultHandler).nthCalledWith(1, { done: false, value: 1 });

    iterator.next().then(...handlers);
    await flushPromises();
    expect(resultHandler).toHaveBeenCalledTimes(2);
    expect(resultHandler).nthCalledWith(2, { done: false, value: 2 });

    expect(failHandler).not.toHaveBeenCalled();
  });
});
