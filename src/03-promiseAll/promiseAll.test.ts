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
import { promiseAll } from "./promiseAll";

describe("promiseAll", () => {
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

  it("should settle immediately when no promises are provided", async () => {
    promiseAll([]).then(...handlers);

    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([]);
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should settle immediately with the resolved values", async () => {
    promiseAll([Promise.resolve(1), Promise.resolve(2)]).then(...handlers);

    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([1, 2]);
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should settle only when all promises resolved", async () => {
    promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      sleep(1000).then(() => 3),
    ]).then(...handlers);

    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([1, 2, 3]);
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should reject when one promise rejects", async () => {
    promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      sleep(1000).then(() => {
        throw new Error("Boom!");
      }),
    ]).then(...handlers);

    vi.runAllTimers();
    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalledWith(new Error("Boom!"));
  });

  it("should not use Promise.all", async () => {
    const spy = vi.spyOn(Promise, "all");

    promiseAll([]).then(...handlers);
    await flushPromises();

    expect(spy).not.toHaveBeenCalled();
  });
});
