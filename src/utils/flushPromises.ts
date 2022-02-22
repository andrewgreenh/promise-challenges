/**
 * Call this to drain the currently pending promises
 * and promises that are scheduled
 */
export async function flushPromises() {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}
