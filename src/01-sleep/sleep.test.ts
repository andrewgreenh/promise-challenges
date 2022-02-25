import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flushPromises } from "../utils/flushPromises";
import { sleep } from "./sleep";

describe("sleep", () => {
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

  it("should return a promise", () => {
    const result = sleep(0).then(...handlers);

    expect(result).toBeInstanceOf(Promise);
  });

  it("should wait for the specified amount of time", async () => {
    sleep(1000).then(...handlers);

    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledOnce();
    expect(resultHandler).toHaveBeenCalledWith(undefined);
    expect(failHandler).not.toHaveBeenCalled();
  });
});
