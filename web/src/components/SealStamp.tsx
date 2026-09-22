"use client";

import { useLedgerState } from "@/lib/useLedgerState";
import { isZeroHex, shortHex } from "@/lib/bid";

/**
 * The page's signature element: the current sealed commitment, live from the indexer,
 * rendered as if physically stamped onto the page — the same way a wax seal proves a letter
 * was closed without revealing what's inside it.
 */
export function SealStamp() {
  const { state, loading } = useLedgerState();

  const hasCommitment = state && !isZeroHex(state.sealedCommitment);

  return (
    <div className="flex items-center gap-4 border-y border-rule/60 py-4">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-seal text-ink animate-stamp"
        style={{ boxShadow: "0 0 0 3px rgba(193,80,46,0.18), inset 0 1px 2px rgba(0,0,0,0.35)" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path
            d="M10 5.5L11.3 8.6L14.6 8.9L12.1 11.1L12.8 14.4L10 12.6L7.2 14.4L7.9 11.1L5.4 8.9L8.7 8.6L10 5.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
          current sealed commitment
        </p>
        <p className="truncate font-mono text-sm text-ink-bright sm:text-base">
          {loading
            ? "reading the ledger…"
            : hasCommitment
              ? `0x${shortHex(state!.sealedCommitment, 10, 8)}`
              : "no bid sealed yet"}
        </p>
      </div>
    </div>
  );
}
