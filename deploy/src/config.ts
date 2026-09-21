import path from "node:path";
import { fileURLToPath } from "node:url";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const contractConfig = {
  privateStateStoreName: "sealed-bid-private-state",
  zkConfigPath: path.resolve(
    currentDir,
    "..",
    "..",
    "contract",
    "src",
    "managed",
    "sealed_bid"
  )
};

export interface Config {
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

export class PreviewConfig implements Config {
  indexer = "https://indexer.preview.midnight.network/api/v4/graphql";
  indexerWS = "wss://indexer.preview.midnight.network/api/v4/graphql/ws";
  node = "https://rpc.preview.midnight.network";
  proofServer = "http://127.0.0.1:6300";
  constructor() {
    setNetworkId("preview");
  }
}

export class PreprodConfig implements Config {
  indexer = "https://indexer.preprod.midnight.network/api/v4/graphql";
  indexerWS = "wss://indexer.preprod.midnight.network/api/v4/graphql/ws";
  node = "https://rpc.preprod.midnight.network";
  proofServer = "http://127.0.0.1:6300";
  constructor() {
    setNetworkId("preprod");
  }
}
