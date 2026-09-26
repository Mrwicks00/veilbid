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

          <div className="mt-4">
            <p className="mb-2 text-xs text-ink-dim">
              sealed bids in this auction ({state.sealedCommitments.length})
            </p>
            {state.sealedCommitments.length === 0 ? (
              <p className="font-mono text-xs text-ink-dim">— none sealed yet —</p>
            ) : (
              <ul className="space-y-1.5">
                {state.sealedCommitments.map((entry) => (
                  <li
                    key={entry.key}
                    className="flex items-center justify-between rounded-md border border-rule/50 bg-ink px-3 py-1.5 font-mono text-[11px] text-ink-bright"
                  >
                    <span className="text-ink-dim">0x{shortHex(entry.key, 6, 4)}</span>
                    <span>0x{shortHex(entry.commitment, 8, 6)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
