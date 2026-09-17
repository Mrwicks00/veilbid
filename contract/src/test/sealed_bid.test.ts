import { SealedBidSimulator } from "./sealed-bid-simulator.js";
import { createSealedBidPrivateState } from "../witnesses.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId("undeployed");

const ZERO_32 = new Uint8Array(32);
const nonceA = "a".repeat(64);
const nonceB = "b".repeat(64);
const bidderAlice = "1".repeat(64);
const bidderBob = "2".repeat(64);

const hexToBytes32 = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

describe("Sealed-bid commitment contract", () => {
  it("starts with all public state empty", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(0n, nonceA, bidderAlice)
    );
    const state = sim.getLedger();
    expect(state.sealedCommitment).toEqual(ZERO_32);
    expect(state.highestBid).toEqual(0n);
    expect(state.winnerId).toEqual(ZERO_32);
    expect(state.bidsSubmitted).toEqual(0n);
  });

  it("submitSealedBid publishes only a commitment, never the amount or bidder", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice)
    );
    const state = sim.submitSealedBid();

    expect(state.sealedCommitment).not.toEqual(ZERO_32);
    expect(state.bidsSubmitted).toEqual(1n);
    // The amount and bidder identity must still be undisclosed at this point.
    expect(state.highestBid).toEqual(0n);
    expect(state.winnerId).toEqual(ZERO_32);
  });

  it("revealBid discloses the amount and bidder once it beats the current highest", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice)
    );
    sim.submitSealedBid();
    const state = sim.revealBid();

    expect(state.highestBid).toEqual(500n);
    expect(state.winnerId).toEqual(hexToBytes32(bidderAlice));
  });

  it("a higher second bid overtakes the first as the disclosed winner", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice)
    );
    sim.submitSealedBid();
    sim.revealBid();

    sim.setPrivateState(createSealedBidPrivateState(750n, nonceB, bidderBob));
    sim.submitSealedBid();
    const state = sim.revealBid();

    expect(state.highestBid).toEqual(750n);
  });

  it("a lower second bid does not overwrite the current highest", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice)
    );
    sim.submitSealedBid();
    sim.revealBid();

    sim.setPrivateState(createSealedBidPrivateState(100n, nonceB, bidderBob));
    sim.submitSealedBid();
    const state = sim.revealBid();

    expect(state.highestBid).toEqual(500n);
  });

  it("rejects a reveal whose witnesses do not match the sealed commitment", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice)
    );
    sim.submitSealedBid();

    // Swap in different witness values after sealing, without re-submitting.
    sim.setPrivateState(createSealedBidPrivateState(999n, nonceB, bidderBob));
    expect(() => sim.revealBid()).toThrow();
  });
});
