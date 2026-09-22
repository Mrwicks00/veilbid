/**
 * Some of the midnight-js provider packages (e.g. httpClientProofProvider) import `fetch`
 * via `cross-fetch` and capture it in a module-scope variable at import time. Native fetch
 * throws "Failed to execute 'fetch' on 'Window': Illegal invocation" when called without
 * `window` as its receiver, which is exactly what happens if cross-fetch's browser
 * resolution under Turbopack captures a reference detached from `window` instead of a
 * bound method.
 *
 * This only works as a side effect of *importing* this module, not of calling some function
 * it exports — ES module imports are hoisted and fully evaluated before any of the
 * importing file's own top-level code runs, so a function call placed after other imports
 * executes too late: by then, cross-fetch's own module has already captured the unbound
 * reference into its closure, and reassigning window.fetch afterwards doesn't retroactively
 * fix what's already captured. This file must be the *first* import in the app's client
 * entry point (HomeClient.tsx) so its binding runs before any sibling import reaches
 * cross-fetch.
 */
if (typeof window !== "undefined" && window.fetch) {
  window.fetch = window.fetch.bind(window);
}
