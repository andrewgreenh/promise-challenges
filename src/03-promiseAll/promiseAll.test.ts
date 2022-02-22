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

  beforeEach(() => {
    resultHandler.mockClear();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should settle immediately when no promises are provided", async () => {
    promiseAll([]).then(resultHandler);

    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([]);
  });

  it("should settle immediately with the resolved values", async () => {
    promiseAll([Promise.resolve(1), Promise.resolve(2)]).then(resultHandler);

    await flushPromises();
    expect(resultHandler).toHaveBeenCalledWith([1, 2]);
  });

  it("should settle only when all promises resolved", async () => {
    promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      sleep(1000).then(() => 3),
    ]).then(resultHandler);

    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("should reject when one promise rejects", async () => {
    promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      sleep(1000).then(() => {
        throw new Error("Boom!");
      }),
    ]).catch(resultHandler);

    vi.runAllTimers();
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith(new Error("Boom!"));
  });

  it("should not use Promise.all", async () => {
    const spy = vi.spyOn(Promise, "all");

    await promiseAll([]);

    expect(spy).not.toHaveBeenCalled();
  });
});
