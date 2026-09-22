import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { toHex, fromHex } from "@midnight-ntwrk/midnight-js-utils";
import type { MidnightProvider, WalletProvider } from "@midnight-ntwrk/midnight-js/types";
import { Transaction } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { SealedBidPrivateStateId, type SealedBidCircuits } from "./contract";
import { FALLBACK_INDEXER_HTTP, FALLBACK_INDEXER_WS } from "./network";

/**
 * Bridges Lace's ConnectedAPI to the WalletProvider + MidnightProvider shape midnight-js
 * expects. Lace does not implement getProvingProvider(), so proving still goes through the
 * local proof server it reports via getConfiguration().
 */
const createWalletAndMidnightProvider = async (
  api: ConnectedAPI
): Promise<WalletProvider & MidnightProvider> => {
  const { shieldedCoinPublicKey, shieldedEncryptionPublicKey } = await api.getShieldedAddresses();
  return {
    getCoinPublicKey: () => shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedEncryptionPublicKey,
    balanceTx: async (tx) => {
      const { tx: balancedHex } = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
      return Transaction.deserialize("signature", "proof", "binding", fromHex(balancedHex));
    },
    submitTx: async (tx) => {
      await api.submitTransaction(toHex(tx.serialize()));
      return tx.identifiers()[0];
    }
  };
};

export const providersFromWallet = async (api: ConnectedAPI) => {
  const config = await api.getConfiguration();
  const zkConfigProvider = new FetchZkConfigProvider<SealedBidCircuits>(window.location.origin);
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(api);
  const { unshieldedAddress } = await api.getUnshieldedAddress();

  const proverServerUri = config.proverServerUri ?? "http://127.0.0.1:6300";
  const storagePassword = `${Buffer.from(unshieldedAddress).toString("base64")}-VeilbidLocal!1`;

  return {
    privateStateProvider: levelPrivateStateProvider<typeof SealedBidPrivateStateId>({
      privateStateStoreName: "veilbid-private-state",
      accountId: unshieldedAddress,
      privateStoragePasswordProvider: () => storagePassword
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexerUri || FALLBACK_INDEXER_HTTP,
      config.indexerWsUri || FALLBACK_INDEXER_WS
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proverServerUri, zkConfigProvider),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider
  };
};
