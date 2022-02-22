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
import { promiseRace } from "./promiseRace";

describe("promiseRace", () => {
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

  it("should return a single promise", () => {
    const result = promiseRace([]);

    expect(result).toBeInstanceOf(Promise);
  });

  it("should never resolve when passed no promises", async () => {
    promiseRace([]).then(...handlers);

    await flushPromises();
    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should resolve with the same value as a single promise", async () => {
    promiseRace([Promise.resolve(1)]).then(...handlers);

    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith(1);
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should resolve to the fastest promise", async () => {
    promiseRace([sleep(2000).then(() => 1), sleep(1000).then(() => 2)]).then(
      ...handlers
    );

    vi.runAllTimers();
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledOnce();
    expect(resultHandler).toHaveBeenCalledWith(2);
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should resolve to the fastest promise even if a slower one throws", async () => {
    promiseRace([
      sleep(2000).then(() => {
        throw new Error("Boom");
      }),
      sleep(1000).then(() => 2),
    ]).then(...handlers);

    vi.runAllTimers();
    await flushPromises();

    expect(resultHandler).toHaveBeenCalledWith(2);
    expect(resultHandler).toHaveBeenCalledOnce();
    expect(failHandler).not.toHaveBeenCalled();
  });

  it("should reject when the first settled promise rejects", async () => {
    promiseRace([
      sleep(1000).then(() => {
        throw new Error("Boom!");
      }),
      sleep(2000).then(() => 2),
    ]).then(...handlers);

    vi.runAllTimers();
    await flushPromises();

    expect(resultHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalledOnce();
    expect(failHandler).toHaveBeenCalledWith(new Error("Boom!"));
  });

  it("should not use Promise.race", async () => {
    const spy = vi.spyOn(Promise, "race");

    promiseRace([Promise.resolve(1)]).then(...handlers);

    await flushPromises();

    expect(spy).not.toHaveBeenCalled();
  });
});
