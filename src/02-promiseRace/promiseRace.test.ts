import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { sleep } from "../01-sleep/sleep";
import { promiseRace } from "./promiseRace";

describe("promiseRace", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should return a single promise", () => {
    const result = promiseRace([]);

    expect(result).toBeInstanceOf(Promise);
  });

  it("should resolve with the same value as a single promise", async () => {
    const promise = promiseRace([Promise.resolve(1)]);

    await expect(promise).resolves.toBe(1);
  });

  it("should resolve to the fastest promise", async () => {
    const promise = promiseRace([
      sleep(2000).then(() => 1),
      sleep(1000).then(() => 2),
    ]);

    vi.runAllTimers();
    await expect(promise).resolves.toBe(2);
  });

  it("should resolve to the fastest promise even if a slower one throws", async () => {
    const promise = promiseRace([
      sleep(2000).then(() => {
        throw new Error("Boom");
      }),
      sleep(1000).then(() => 2),
    ]);

    vi.runAllTimers();
    await expect(promise).resolves.toBe(2);
  });

  it("should reject when the first settled promise rejects", async () => {
    const promise = promiseRace([
      sleep(1000).then(() => {
        throw new Error("Boom!");
      }),
      sleep(2000).then(() => 2),
    ]);

    vi.runAllTimers();
    await expect(promise).rejects.toEqual(new Error("Boom!"));
  });

  it("should not use Promise.race", async () => {
    const spy = vi.spyOn(Promise, "race");

    await promiseRace([Promise.resolve(1)]);

    expect(spy).not.toHaveBeenCalled();
  });
});
