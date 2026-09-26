import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type { Ledger } from "./managed/sealed_bid/contract/index.js";

// Private state held locally by a bidder. None of this is ever sent to the
// chain unless a circuit explicitly discloses it.
export type SealedBidPrivateState = {
  bidAmount: bigint;
  bidNonce: string; // 32-byte hex string
  bidderId: string; // 32-byte hex string
  slotKey: string; // 32-byte hex string — random per-bid Map handle, no identity meaning
};

export const createSealedBidPrivateState = (
  bidAmount: bigint,
  bidNonce: string,
  bidderId: string,
  slotKey: string
): SealedBidPrivateState => ({ bidAmount, bidNonce, bidderId, slotKey });

const hexToBytes32 = (hex: string): Uint8Array => {
  const clean = hex.length === 64 ? hex : hex.padStart(64, "0");
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

export const witnesses = {
  bidAmount(
    context: WitnessContext<Ledger, SealedBidPrivateState>
  ): [SealedBidPrivateState, bigint] {
    return [context.privateState, context.privateState.bidAmount];
  },
  bidNonce(
    context: WitnessContext<Ledger, SealedBidPrivateState>
  ): [SealedBidPrivateState, Uint8Array] {
    return [context.privateState, hexToBytes32(context.privateState.bidNonce)];
  },
  bidderId(
    context: WitnessContext<Ledger, SealedBidPrivateState>
  ): [SealedBidPrivateState, Uint8Array] {
    return [context.privateState, hexToBytes32(context.privateState.bidderId)];
  },
  slotKey(
    context: WitnessContext<Ledger, SealedBidPrivateState>
  ): [SealedBidPrivateState, Uint8Array] {
    return [context.privateState, hexToBytes32(context.privateState.slotKey)];
  }
};
