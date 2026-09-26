"use client";

import { useLedgerState } from "@/lib/useLedgerState";
import { shortHex } from "@/lib/bid";

/**
 * The auction's public feed: every currently-sealed bid, live from the Preview indexer, with no
 * wallet required to view it. Each row is a real, independent commitment slot — this is the
 * clearest possible proof that many bidders can hold sealed bids at once without any of them
 * overwriting another, and that nobody (including this page) can see who submitted a row or
 * for how much until that specific bid is revealed.
 */
export function PublicLedgerPanel() {
  const { state, error, loading } = useLedgerState();

  return (
    <section className="flex h-full flex-col rounded-lg border border-proof-dim/60 bg-paper p-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-xl italic text-ink-bright">Live sealed bids</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-proof">
          on-chain, anonymous
        </span>
      </header>

      <div className="flex-1">
        {loading && !state ? (
          <p className="text-sm text-ink-dim">Reading the Preview indexer…</p>
        ) : error ? (
          <p className="text-sm text-seal">{error}</p>
        ) : state && state.sealedCommitments.length > 0 ? (
          <ul className="space-y-1.5">
            {state.sealedCommitments.map((entry) => (
              <li
                key={entry.key}
                className="flex items-center justify-between rounded-md border border-rule/50 bg-ink px-3 py-2 font-mono text-[11px] text-ink-bright"
              >
                <span className="text-ink-dim">0x{shortHex(entry.key, 6, 4)}</span>
                <span>0x{shortHex(entry.commitment, 8, 6)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-dim">No bids sealed yet — be the first.</p>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-ink-dim">
        Each row is a hash commitment under its own slot — read directly from the indexer, the
        same way any visitor to this page can verify for themselves. The amount and bidder behind
        a row stay unknown until that exact bid is revealed.
      </p>
    </section>
  );
}
