"use client";

import { useLedgerState } from "@/lib/useLedgerState";
import { isZeroHex, shortHex } from "@/lib/bid";

function Stat({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: "seal" | "proof";
}) {
  return (
    <div className="min-w-[120px] flex-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">{label}</p>
      <p
        className={`mt-1 font-mono text-lg ${
          accent === "proof" ? "text-proof" : accent === "seal" ? "text-seal" : "text-ink-bright"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * The auction's live pulse: how many independent sealed bids exist right now, and what (if
 * anything) has been disclosed so far. Separated from the sealed-bids list itself so the numbers
 * read at a glance without scrolling a feed.
 */
export function AuctionStatusBar() {
  const { state, loading } = useLedgerState();
  const sealedCount = state?.sealedCommitments.length ?? 0;
  const hasWinner = !!state && !isZeroHex(state.winnerId);

  return (
    <div className="flex flex-wrap items-stretch gap-6 border-y border-rule/60 py-5">
      <Stat label="bids sealed" value={loading ? "…" : sealedCount.toString()} accent="seal" />
      <Stat
        label="highest revealed"
        value={
          loading
            ? "…"
            : state && state.highestBid > 0n
              ? `${state.highestBid.toLocaleString()} tNIGHT`
              : "— sealed —"
        }
        accent="proof"
      />
      <Stat
        label="winner"
        value={loading ? "…" : hasWinner ? `0x${shortHex(state!.winnerId, 6, 4)}` : "— sealed —"}
      />
    </div>
  );
}
