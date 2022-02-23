import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../utils/flushPromises";
import { promiseHandle } from "./promiseHandle";

describe("promiseHandle", () => {
  it("should resolve the promise when calling resolve", async () => {
    const resultHandler = vi.fn();
    const handle = promiseHandle<number>();

    handle.promise.then(resultHandler);

    await flushPromises();
    expect(resultHandler).not.toHaveBeenCalled();

    handle.resolve(1);
    await flushPromises();
    expect(resultHandler).toHaveBeenCalledWith(1);
  });

  it("should reject the promise when calling reject", async () => {
    const resultHandler = vi.fn();
    const handle = promiseHandle<number>();

    handle.promise.catch(resultHandler);

    await flushPromises();
    expect(resultHandler).not.toHaveBeenCalled();

    handle.reject(1);
    await flushPromises();
    expect(resultHandler).toHaveBeenCalledWith(1);
  });
});
