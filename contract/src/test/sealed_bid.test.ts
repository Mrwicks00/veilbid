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
const slotAlice = "3".repeat(64);
const slotBob = "4".repeat(64);

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
      createSealedBidPrivateState(0n, nonceA, bidderAlice, slotAlice)
    );
    const state = sim.getLedger();
    expect(state.sealedCommitments.isEmpty()).toBe(true);
    expect(state.highestBid).toEqual(0n);
    expect(state.winnerId).toEqual(ZERO_32);
    expect(state.bidsSubmitted).toEqual(0n);
  });

  it("submitSealedBid publishes only a commitment, never the amount or bidder", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice)
    );
    const state = sim.submitSealedBid();

    expect(state.sealedCommitments.member(hexToBytes32(slotAlice))).toBe(true);
    expect(state.sealedCommitments.lookup(hexToBytes32(slotAlice))).not.toEqual(ZERO_32);
    expect(state.bidsSubmitted).toEqual(1n);
    // The amount and bidder identity must still be undisclosed at this point.
    expect(state.highestBid).toEqual(0n);
    expect(state.winnerId).toEqual(ZERO_32);
  });

  it("two bidders can hold independent sealed bids at the same time", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice)
    );
    sim.submitSealedBid();

    sim.setPrivateState(createSealedBidPrivateState(750n, nonceB, bidderBob, slotBob));
    const state = sim.submitSealedBid();

    // Neither bidder's slot overwrote the other's.
    expect(state.bidsSubmitted).toEqual(2n);
    expect(state.sealedCommitments.member(hexToBytes32(slotAlice))).toBe(true);
    expect(state.sealedCommitments.member(hexToBytes32(slotBob))).toBe(true);
    expect(state.sealedCommitments.lookup(hexToBytes32(slotAlice))).not.toEqual(
      state.sealedCommitments.lookup(hexToBytes32(slotBob))
    );
    // Still nothing disclosed about amounts or identities.
    expect(state.highestBid).toEqual(0n);
    expect(state.winnerId).toEqual(ZERO_32);
  });

  it("revealBid discloses the amount and bidder once it beats the current highest", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice)
    );
    sim.submitSealedBid();
    const state = sim.revealBid();

    expect(state.highestBid).toEqual(500n);
    expect(state.winnerId).toEqual(hexToBytes32(bidderAlice));
  });

  it("a higher concurrent bid overtakes the lower one regardless of reveal order", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice)
    );
    sim.submitSealedBid();
    sim.setPrivateState(createSealedBidPrivateState(750n, nonceB, bidderBob, slotBob));
    sim.submitSealedBid();

    // Lower bid reveals first.
    sim.setPrivateState(createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice));
    let state = sim.revealBid();
    expect(state.highestBid).toEqual(500n);

    // Higher bid reveals second and overtakes.
    sim.setPrivateState(createSealedBidPrivateState(750n, nonceB, bidderBob, slotBob));
    state = sim.revealBid();
    expect(state.highestBid).toEqual(750n);
    expect(state.winnerId).toEqual(hexToBytes32(bidderBob));
  });

  it("a lower concurrent bid does not overwrite the current highest, in either reveal order", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(750n, nonceB, bidderBob, slotBob)
    );
    sim.submitSealedBid();
    sim.setPrivateState(createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice));
    sim.submitSealedBid();

    // Higher bid reveals first.
    sim.setPrivateState(createSealedBidPrivateState(750n, nonceB, bidderBob, slotBob));
    sim.revealBid();

    // Lower bid reveals second and does not overtake.
    sim.setPrivateState(createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice));
    const state = sim.revealBid();
    expect(state.highestBid).toEqual(750n);
    expect(state.winnerId).toEqual(hexToBytes32(bidderBob));
  });

  it("rejects a reveal for a slot that was never sealed", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice)
    );
    sim.submitSealedBid();

    // Different slotKey than the one actually submitted.
    sim.setPrivateState(createSealedBidPrivateState(999n, nonceB, bidderBob, slotBob));
    expect(() => sim.revealBid()).toThrow();
  });

  it("rejects a reveal whose witnesses do not match the sealed commitment for that slot", () => {
    const sim = new SealedBidSimulator(
      createSealedBidPrivateState(500n, nonceA, bidderAlice, slotAlice)
    );
    sim.submitSealedBid();

    // Same slotKey, but different amount/nonce/bidder than what was sealed.
    sim.setPrivateState(createSealedBidPrivateState(999n, nonceB, bidderBob, slotAlice));
    expect(() => sim.revealBid()).toThrow();
  });
});
