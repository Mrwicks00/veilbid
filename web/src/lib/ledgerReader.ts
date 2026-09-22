import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { SealedBid } from "@veilbid/contract";
import { CONTRACT_ADDRESS, FALLBACK_INDEXER_HTTP, FALLBACK_INDEXER_WS, NETWORK_ID } from "./network";

setNetworkId(NETWORK_ID);

export type SealedBidLedgerState = {
  sealedCommitment: string;
  highestBid: bigint;
  winnerId: string;
  bidsSubmitted: bigint;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/**
 * Reads the contract's public ledger state directly from the indexer — no wallet connection
 * required. This is what proves the frontend is really wired to the on-chain contract: the
 * "Public Ledger" panel works before anyone connects Lace at all.
 */
export async function readSealedBidLedger(): Promise<SealedBidLedgerState | null> {
  const publicDataProvider = indexerPublicDataProvider(FALLBACK_INDEXER_HTTP, FALLBACK_INDEXER_WS);
  const contractState = await publicDataProvider.queryContractState(CONTRACT_ADDRESS);
  if (!contractState) return null;

  const ledger = SealedBid.ledger(contractState.data);
  return {
    sealedCommitment: bytesToHex(ledger.sealedCommitment),
    highestBid: ledger.highestBid,
    winnerId: bytesToHex(ledger.winnerId),
    bidsSubmitted: ledger.bidsSubmitted
  };
}
