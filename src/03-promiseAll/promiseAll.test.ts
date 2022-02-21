import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { sleep } from "../01-sleep/sleep";
import { promiseAll } from "./promiseAll";

describe("promiseAll", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should settle immediately when no promises are provided", () => {
    const result = promiseAll([]);

    expect(result).resolves.toEqual([]);
  });

  it("should settle immediately with the resolved values", () => {
    const result = promiseAll([Promise.resolve(1), Promise.resolve(2)]);

    expect(result).resolves.toEqual([1, 2]);
  });

  it("should settle only when all promises resolved", async () => {
    const handler = vi.fn().mockImplementation((x) => x);

    const result = promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      sleep(1000).then(() => 3),
    ]).then(handler);

    await Promise.resolve();

    vi.advanceTimersByTime(500);

    await Promise.resolve();

    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    await expect(result).resolves.toEqual([1, 2, 3]);

    expect(handler).toHaveBeenCalled();
  });

  it("should reject when one promise rejects", async () => {
    const result = promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      sleep(1000).then(() => {
        throw new Error("Boom!");
      }),
    ]);

    vi.runAllTimers();

    await expect(result).rejects.toEqual(new Error("Boom!"));
  });

  it("should not use Promise.all", async () => {
    const spy = vi.spyOn(Promise, "all");

    await promiseAll([]);

    expect(spy).not.toHaveBeenCalled();
  });
});
