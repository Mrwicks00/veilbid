"use client";

import { useContract } from "@/contexts/ContractContext";
import { shortHex } from "@/lib/bid";

function LockIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      {open ? (
        <path d="M6.5 9V6.5a3.5 3.5 0 0 1 6.5-1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      ) : (
        <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function PrivacyLedger() {
  const { myBid, disclosed } = useContract();

  const hasBid = !!myBid;

  return (
    <section className="rounded-lg border border-rule bg-paper p-6">
      <header className="mb-6">
        <h2 className="font-display text-xl italic text-ink-bright">The privacy ledger</h2>
        <p className="mt-1 text-xs text-ink-dim">
          Two pages of the same book. What you know, and what the chain knows.
        </p>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-0 sm:grid-cols-[1fr_auto_1fr]">
        {/* Private page */}
        <div className="rounded-lg border border-seal-dim/50 bg-ink p-5 sm:rounded-r-none sm:border-r-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-seal">your page — private</p>
          {hasBid ? (
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-[11px] text-ink-dim">amount</dt>
                <dd className="font-mono text-ink-bright">{myBid.amount.toLocaleString()} tNIGHT</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-dim">nonce</dt>
                <dd className="font-mono text-ink-bright">0x{shortHex(myBid.nonce)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-dim">bidder id</dt>
                <dd className="font-mono text-ink-bright">0x{shortHex(myBid.bidderId)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-dim">Seal a bid to write this page.</p>
          )}
        </div>

        {/* Seal */}
        <div className="flex items-center justify-center border-x border-rule/60 bg-paper-raised px-3 py-4 sm:border-y sm:py-0">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full border-2 transition-colors duration-500 ${
              disclosed ? "border-proof text-proof" : "border-seal text-seal"
            }`}
          >
            <LockIcon open={disclosed} />
          </div>
        </div>

        {/* Public page */}
        <div className="rounded-lg border border-proof-dim/50 bg-ink p-5 sm:rounded-l-none sm:border-l-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-proof">the chain&apos;s page — public</p>
          {disclosed && myBid ? (
            <dl className="mt-3 space-y-2 animate-ink-in">
              <div>
                <dt className="text-[11px] text-ink-dim">amount</dt>
                <dd className="font-mono text-ink-bright">{myBid.amount.toLocaleString()} tNIGHT</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-dim">bidder id</dt>
                <dd className="font-mono text-ink-bright">0x{shortHex(myBid.bidderId)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-dim">status</dt>
                <dd className="text-proof">disclosed — new highest bid</dd>
              </div>
            </dl>
          ) : hasBid ? (
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-[11px] text-ink-dim">amount</dt>
                <dd className="font-mono text-ink-dim">— sealed —</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-dim">bidder id</dt>
                <dd className="font-mono text-ink-dim">— sealed —</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-dim">status</dt>
                <dd className="text-ink-dim">only a commitment hash is public</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-dim">Nothing to show yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
