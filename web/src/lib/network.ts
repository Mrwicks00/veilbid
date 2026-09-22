export const NETWORK_ID = (process.env.NEXT_PUBLIC_NETWORK_ID ?? "preview") as
  | "preview"
  | "preprod"
  | "mainnet"
  | "undeployed";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0400eed09ee11423a976fb09750a76fb0ac7974ac04e797c6f3c203bdd750418";

const DEFAULT_INDEXER: Record<string, { http: string; ws: string }> = {
  preview: {
    http: "https://indexer.preview.midnight.network/api/v4/graphql",
    ws: "wss://indexer.preview.midnight.network/api/v4/graphql/ws"
  },
  preprod: {
    http: "https://indexer.preprod.midnight.network/api/v4/graphql",
    ws: "wss://indexer.preprod.midnight.network/api/v4/graphql/ws"
  }
};

export const FALLBACK_INDEXER_HTTP =
  process.env.NEXT_PUBLIC_INDEXER_HTTP ?? DEFAULT_INDEXER[NETWORK_ID]?.http ?? DEFAULT_INDEXER.preview.http;

export const FALLBACK_INDEXER_WS =
  process.env.NEXT_PUBLIC_INDEXER_WS ?? DEFAULT_INDEXER[NETWORK_ID]?.ws ?? DEFAULT_INDEXER.preview.ws;
