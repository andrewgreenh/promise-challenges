import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should return a promise", () => {
    const result = sleep(0);

    expect(result).toBeInstanceOf(Promise);
  });

  it("should wait for the specified amount of time", async () => {
    const afterSleep = vi.fn();

    const promise = sleep(1000).then(afterSleep);

    expect(afterSleep).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await Promise.resolve();

    expect(afterSleep).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await Promise.resolve();

    expect(afterSleep).toHaveBeenCalledOnce();
    expect(afterSleep).toHaveBeenCalledWith(undefined);

    return promise;
  });
});
