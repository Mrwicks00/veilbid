/**
 * Some of the midnight-js provider packages (e.g. httpClientProofProvider) import `fetch`
 * via `cross-fetch` and call it as a bare function reference. Native `fetch` throws
 * "Failed to execute 'fetch' on 'Window': Illegal invocation" when called without `window`
 * as its receiver, which is exactly what happens if a bundler resolves that import to a
 * reference detached from `window` instead of a bound method. Re-binding it once, globally,
 * before any provider code runs fixes every call site at once regardless of which package
 * (or which of their own transitive deps) is responsible.
 */
export function ensureFetchIsBound(): void {
  if (typeof window === "undefined" || !window.fetch) return;
  window.fetch = window.fetch.bind(window);
}
