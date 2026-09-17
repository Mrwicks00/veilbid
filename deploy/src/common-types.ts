import { SealedBid, type SealedBidPrivateState } from "@veilbid/contract";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js/types";
import type { DeployedContract, FoundContract } from "@midnight-ntwrk/midnight-js/contracts";
import type { ProvableCircuitId } from "@midnight-ntwrk/compact-js";

export type SealedBidCircuits = ProvableCircuitId<SealedBid.Contract<SealedBidPrivateState>>;

export const SealedBidPrivateStateId = "sealedBidPrivateState";

export type SealedBidProviders = MidnightProviders<
  SealedBidCircuits,
  typeof SealedBidPrivateStateId,
  SealedBidPrivateState
>;

export type SealedBidContract = SealedBid.Contract<SealedBidPrivateState>;

export type DeployedSealedBidContract =
  | DeployedContract<SealedBidContract>
  | FoundContract<SealedBidContract>;
