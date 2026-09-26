"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createSealedBidPrivateState, type SealedBidPrivateState } from "@veilbid/contract";
import type { FoundContract } from "@midnight-ntwrk/midnight-js/contracts";
import { providersFromWallet } from "@/lib/providers";
import {
  joinSealedBidContract,
  SealedBidPrivateStateId,
  type SealedBid,
  type SealedBidProviders
} from "@/lib/contract";
import { randomHex32 } from "@/lib/bid";
import { useWallet } from "./WalletContext";

export type BidRecord = {
  amount: bigint;
  nonce: string;
  bidderId: string;
  slotKey: string;
};

type CallPhase = "idle" | "proving" | "submitted" | "error";

type SealedBidContract = FoundContract<SealedBid.Contract<SealedBidPrivateState>>;

type ContractContextValue = {
  phase: CallPhase;
  error: string | null;
  lastTxId: string | null;
  myBid: BidRecord | null;
  disclosed: boolean;
  submitBid: (amountNight: bigint) => Promise<void>;
  reveal: () => Promise<void>;
  reset: () => void;
};

const ContractContext = createContext<ContractContextValue | null>(null);

const ZERO_HEX = "0".repeat(64);

export function ContractProvider({ children }: { children: ReactNode }) {
  const { api } = useWallet();
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [myBid, setMyBid] = useState<BidRecord | null>(null);
  const [disclosed, setDisclosed] = useState(false);

  const sessionRef = useRef<{ providers: SealedBidProviders; contract: SealedBidContract } | null>(
    null
  );

  const getSession = useCallback(async () => {
    if (!api) throw new Error("Connect Lace before submitting a bid.");
    if (sessionRef.current) return sessionRef.current;

    const providers = await providersFromWallet(api);
    const placeholder: SealedBidPrivateState = createSealedBidPrivateState(0n, ZERO_HEX, ZERO_HEX, ZERO_HEX);
    const contract = await joinSealedBidContract(providers, placeholder);
    sessionRef.current = { providers, contract };
    return sessionRef.current;
  }, [api]);

  const submitBid = useCallback(
    async (amountNight: bigint) => {
      setPhase("proving");
      setError(null);
      setDisclosed(false);
      try {
        const bid: BidRecord = {
          amount: amountNight,
          nonce: randomHex32(),
          bidderId: randomHex32(),
          slotKey: randomHex32()
        };
        const { providers, contract } = await getSession();
        await providers.privateStateProvider.set(
          SealedBidPrivateStateId,
          createSealedBidPrivateState(bid.amount, bid.nonce, bid.bidderId, bid.slotKey)
        );
        const result = await contract.callTx.submitSealedBid();
        setMyBid(bid);
        setLastTxId(result.public.txId);
        setPhase("submitted");
      } catch (err) {
        setPhase("error");
        setError(err instanceof Error ? err.message : "Failed to submit sealed bid.");
      }
    },
    [getSession]
  );

  const reveal = useCallback(async () => {
    if (!myBid) {
      setError("Submit a sealed bid before revealing it.");
      setPhase("error");
      return;
    }
    setPhase("proving");
    setError(null);
    try {
      const { providers, contract } = await getSession();
      await providers.privateStateProvider.set(
        SealedBidPrivateStateId,
        createSealedBidPrivateState(myBid.amount, myBid.nonce, myBid.bidderId, myBid.slotKey)
      );
      const result = await contract.callTx.revealBid();
      setLastTxId(result.public.txId);
      setDisclosed(true);
      setPhase("submitted");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Failed to reveal bid.");
    }
  }, [getSession, myBid]);

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setLastTxId(null);
    setMyBid(null);
    setDisclosed(false);
  }, []);

  const value = useMemo<ContractContextValue>(
    () => ({ phase, error, lastTxId, myBid, disclosed, submitBid, reveal, reset }),
    [phase, error, lastTxId, myBid, disclosed, submitBid, reveal, reset]
  );

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}

export function useContract(): ContractContextValue {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error("useContract must be used within a ContractProvider");
  return ctx;
}
