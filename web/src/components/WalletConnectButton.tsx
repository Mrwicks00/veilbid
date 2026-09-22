"use client";

import { useWallet } from "@/contexts/WalletContext";
import { shortHex } from "@/lib/bid";

export function WalletConnectButton() {
  const { status, snapshot, error, isLaceInstalled, connect, disconnect } = useWallet();

  if (status === "connected" && snapshot) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline font-mono text-xs text-proof tabular-nums">
          {shortHex(snapshot.address.replace(/^mn_addr_[a-z]+1/, ""), 6, 4)}
        </span>
        <button
          onClick={disconnect}
          className="rounded-full border border-rule px-4 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-seal hover:text-seal cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={connect}
        disabled={status === "connecting"}
        className="rounded-full bg-proof px-5 py-1.5 text-xs font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-wait"
      >
        {status === "connecting" ? "Waiting for Lace…" : "Connect Lace"}
      </button>
      {!isLaceInstalled && status !== "connecting" && (
        <a
          href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-ink-dim underline decoration-rule underline-offset-2 hover:text-ink-bright"
        >
          Install Lace
        </a>
      )}
      {error && <p className="max-w-[220px] text-right text-[11px] text-seal">{error}</p>}
    </div>
  );
}
