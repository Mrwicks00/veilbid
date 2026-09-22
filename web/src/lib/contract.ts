import { SealedBid, witnesses, type SealedBidPrivateState } from "@veilbid/contract";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js/contracts";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js/types";
import type { ProvableCircuitId } from "@midnight-ntwrk/compact-js";
import { CONTRACT_ADDRESS } from "./network";

export type SealedBidCircuits = ProvableCircuitId<SealedBid.Contract<SealedBidPrivateState>>;

export const SealedBidPrivateStateId = "sealedBidPrivateState";

export type SealedBidProviders = MidnightProviders<
  SealedBidCircuits,
  typeof SealedBidPrivateStateId,
  SealedBidPrivateState
>;

const sealedBidCompiledContract = CompiledContract.make("sealed_bid", SealedBid.Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  // FetchZkConfigProvider resolves circuit assets from its own baseURL directly, so this tag
  // only needs to be a stable, non-empty identifier — it isn't used as a real filesystem path
  // in the browser the way it is for NodeZkConfigProvider in the Node deploy script.
  CompiledContract.withCompiledFileAssets("sealed_bid")
);

/** Joins the already-deployed sealed-bid contract (see the Level 1 deploy) — never redeploys. */
export const joinSealedBidContract = (providers: SealedBidProviders, initialPrivateState: SealedBidPrivateState) =>
  findDeployedContract(providers, {
    contractAddress: CONTRACT_ADDRESS,
    compiledContract: sealedBidCompiledContract,
    privateStateId: SealedBidPrivateStateId,
    initialPrivateState
  });

export type { SealedBid };
