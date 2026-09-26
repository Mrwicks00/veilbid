export const NETWORK_ID = (process.env.NEXT_PUBLIC_NETWORK_ID ?? "preview") as
  | "preview"
  | "preprod"
  | "mainnet"
  | "undeployed";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "00a828a2f34e3132db47a8e8c27436eed7e89e5edd359cddd11ea9bdf5a74a2a";

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
