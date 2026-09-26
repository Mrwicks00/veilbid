import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { SealedBid } from "@veilbid/contract";
import { CONTRACT_ADDRESS, FALLBACK_INDEXER_HTTP, FALLBACK_INDEXER_WS, NETWORK_ID } from "./network";

setNetworkId(NETWORK_ID);

export type SealedCommitmentEntry = {
  key: string;
  commitment: string;
};

export type SealedBidLedgerState = {
  sealedCommitments: SealedCommitmentEntry[];
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
  const sealedCommitments: SealedCommitmentEntry[] = Array.from(ledger.sealedCommitments).map(
    ([key, commitment]) => ({ key: bytesToHex(key), commitment: bytesToHex(commitment) })
  );

  return {
    sealedCommitments,
    highestBid: ledger.highestBid,
    winnerId: bytesToHex(ledger.winnerId),
    bidsSubmitted: ledger.bidsSubmitted
  };
}
