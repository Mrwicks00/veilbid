"use client";

import { useLedgerState } from "@/lib/useLedgerState";
import { isZeroHex, shortHex } from "@/lib/bid";

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-rule/60 py-2.5 last:border-0">
      <span className="text-xs text-ink-dim">{label}</span>
      <span className={`text-sm text-ink-bright ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export function PublicLedgerPanel() {
  const { state, error, loading } = useLedgerState();

  return (
    <section className="rounded-lg border border-proof-dim/60 bg-paper p-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-xl italic text-ink-bright">Public ledger</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-proof">on-chain</span>
      </header>

      {loading && !state ? (
        <p className="text-sm text-ink-dim">Reading the Preview indexer…</p>
      ) : error ? (
        <p className="text-sm text-seal">{error}</p>
      ) : state ? (
        <div>
          <Row label="sealed commitment" value={`0x${shortHex(state.sealedCommitment, 8, 6)}`} />
          <Row label="bids submitted" value={state.bidsSubmitted.toString()} mono={false} />
          <Row
            label="highest bid disclosed"
            value={state.highestBid > 0n ? `${state.highestBid.toLocaleString()} tNIGHT` : "— sealed —"}
            mono={false}
          />
          <Row
            label="winner"
            value={isZeroHex(state.winnerId) ? "— sealed —" : `0x${shortHex(state.winnerId, 6, 4)}`}
          />
        </div>
      ) : (
        <p className="text-sm text-ink-dim">No contract state found.</p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-ink-dim">
        Read directly from the Preview indexer — no wallet required. This is exactly what any
        visitor to this page can verify for themselves.
      </p>
    </section>
  );
}
