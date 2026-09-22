"use client";

import { useEffect, useState } from "react";
import { readSealedBidLedger, type SealedBidLedgerState } from "./ledgerReader";

/**
 * Polls the contract's public ledger state directly from the indexer, independent of any
 * wallet connection. This is what backs the "Public Ledger" panel: it works before anyone
 * connects Lace, proving the frontend reads the real on-chain contract.
 */
export function useLedgerState(pollMs = 8000) {
  const [state, setState] = useState<SealedBidLedgerState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const next = await readSealedBidLedger();
        if (!cancelled) {
          setState(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to read the public ledger.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    poll();
    const id = setInterval(poll, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return { state, error, loading };
}
