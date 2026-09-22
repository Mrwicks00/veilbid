"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContract } from "@/contexts/ContractContext";

export function BidPanel() {
  const { status } = useWallet();
  const { phase, error, myBid, disclosed, submitBid, reveal, reset } = useContract();
  const [amount, setAmount] = useState("");

  const connected = status === "connected";
  const busy = phase === "proving";
  const canSubmit = connected && !busy && amount.trim().length > 0 && !myBid;
  const canReveal = connected && !busy && myBid && !disclosed;

  return (
    <section className="rounded-lg border border-seal-dim/60 bg-paper p-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-xl italic text-ink-bright">Seal a bid</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-seal">private</span>
      </header>

      {!myBid ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = BigInt(Math.max(0, Math.floor(Number(amount) || 0)));
            void submitBid(value);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="bid-amount" className="mb-1.5 block text-xs text-ink-dim">
              Your bid, in tNIGHT
            </label>
            <input
              id="bid-amount"
              type="number"
              min={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              disabled={!connected || busy}
              className="w-full rounded-md border border-rule bg-ink px-3 py-2 font-mono text-sm text-ink-bright outline-none placeholder:text-ink-dim/60 focus:border-seal disabled:opacity-50"
            />
          </div>
          <p className="text-xs leading-relaxed text-ink-dim">
            This amount never leaves your browser. Only a cryptographic commitment of it is
            written to the public ledger.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-md bg-seal py-2.5 text-sm font-semibold text-ink-bright transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Sealing…" : connected ? "Seal this bid" : "Connect Lace to bid"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-rule bg-ink p-4">
            <p className="text-xs text-ink-dim">Your sealed amount (visible only to you)</p>
            <p className="mt-1 font-mono text-lg text-ink-bright">
              {myBid.amount.toLocaleString()} <span className="text-ink-dim text-sm">tNIGHT</span>
            </p>
          </div>
          {disclosed ? (
            <div className="rounded-md border border-proof-dim/60 bg-proof/10 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-proof">
                disclosed on-chain
              </p>
              <p className="mt-1 text-sm text-ink-bright">
                Your bid was the new highest, so the amount and your bidder id are now public
                ledger state.
              </p>
            </div>
          ) : (
            <button
              onClick={() => void reveal()}
              disabled={!canReveal}
              className="w-full rounded-md border border-proof bg-transparent py-2.5 text-sm font-semibold text-proof transition-colors hover:bg-proof/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Revealing…" : "Reveal this bid"}
            </button>
          )}
          <button
            onClick={reset}
            className="w-full text-center text-xs text-ink-dim underline decoration-rule underline-offset-2 hover:text-ink-bright"
          >
            Start a new bid
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-seal">{error}</p>}
    </section>
  );
}
