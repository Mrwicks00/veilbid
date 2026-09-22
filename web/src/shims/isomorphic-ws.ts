// `isomorphic-ws`'s browser build only exports a default, but
// `@midnight-ntwrk/midnight-js-indexer-public-data-provider` imports it as
// `import * as ws from 'isomorphic-ws'` and reads `ws.WebSocket`, which Turbopack's
// stricter ESM analysis rejects as a named export that doesn't exist. The browser already
// has a native WebSocket global, so this shim re-exports that directly and is aliased in
// next.config.ts for Turbopack only — Node-side code (tests, the Level 1 deploy script)
// never resolves through this file.
export const WebSocket = globalThis.WebSocket;
export default WebSocket;
