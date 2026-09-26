import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ENV_KEYS = [
  "NEXT_PUBLIC_NETWORK_ID",
  "NEXT_PUBLIC_CONTRACT_ADDRESS",
  "NEXT_PUBLIC_INDEXER_HTTP",
  "NEXT_PUBLIC_INDEXER_WS"
] as const;

const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  vi.resetModules();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("network defaults", () => {
  it("defaults to preview with the deployed Level 1 contract address", async () => {
    const { NETWORK_ID, CONTRACT_ADDRESS } = await import("./network");
    expect(NETWORK_ID).toBe("preview");
    expect(CONTRACT_ADDRESS).toBe("00a828a2f34e3132db47a8e8c27436eed7e89e5edd359cddd11ea9bdf5a74a2a");
  });

  it("defaults the indexer endpoints to Preview when no network is set", async () => {
    const { FALLBACK_INDEXER_HTTP, FALLBACK_INDEXER_WS } = await import("./network");
    expect(FALLBACK_INDEXER_HTTP).toContain("indexer.preview.midnight.network");
    expect(FALLBACK_INDEXER_WS).toContain("indexer.preview.midnight.network");
  });

  it("switches indexer defaults to Preprod when NEXT_PUBLIC_NETWORK_ID is preprod", async () => {
    process.env.NEXT_PUBLIC_NETWORK_ID = "preprod";
    const { FALLBACK_INDEXER_HTTP, FALLBACK_INDEXER_WS } = await import("./network");
    expect(FALLBACK_INDEXER_HTTP).toContain("indexer.preprod.midnight.network");
    expect(FALLBACK_INDEXER_WS).toContain("indexer.preprod.midnight.network");
  });

  it("lets explicit env vars override every default", async () => {
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = "deadbeef";
    process.env.NEXT_PUBLIC_INDEXER_HTTP = "https://example.test/graphql";
    const { CONTRACT_ADDRESS, FALLBACK_INDEXER_HTTP } = await import("./network");
    expect(CONTRACT_ADDRESS).toBe("deadbeef");
    expect(FALLBACK_INDEXER_HTTP).toBe("https://example.test/graphql");
  });
});
