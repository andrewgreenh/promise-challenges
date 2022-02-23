import { sleep } from "../01-sleep/sleep";

export async function resolveAfter<T>(ms: number, value: T): Promise<T> {
  await sleep(ms);
  return value;
}
