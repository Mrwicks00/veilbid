import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // See src/shims/isomorphic-ws.ts for why this is needed.
      "isomorphic-ws": "./src/shims/isomorphic-ws.ts"
    }
  }
};

export default nextConfig;
