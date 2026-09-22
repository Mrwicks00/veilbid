"use client";

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { connectLace, findLaceInitialApi, type WalletSnapshot } from "@/lib/wallet";
import { NETWORK_ID } from "@/lib/network";

setNetworkId(NETWORK_ID);

type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

type WalletContextValue = {
  status: WalletStatus;
  api: ConnectedAPI | null;
  snapshot: WalletSnapshot | null;
  error: string | null;
  isLaceInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [api, setApi] = useState<ConnectedAPI | null>(null);
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLaceInstalled, setIsLaceInstalled] = useState(false);

  useEffect(() => {
    // The Lace extension injects window.midnight.mnLace slightly after page load, so a
    // single check on mount can miss it. Poll briefly instead.
    const check = () => setIsLaceInstalled(!!findLaceInitialApi());
    check();
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    try {
      const result = await connectLace();
      setApi(result.api);
      setSnapshot(result.snapshot);
      setStatus("connected");
    } catch (err) {
      setStatus("error");
      setApi(null);
      setSnapshot(null);
      setError(err instanceof Error ? err.message : "Failed to connect to Lace.");
    }
  }, []);

  const disconnect = useCallback(() => {
    // The DApp Connector API has no explicit disconnect call — a DApp "disconnects" by
    // dropping its reference to the ConnectedAPI and clearing local session state. Lace
    // itself keeps no record of us having done so.
    setApi(null);
    setSnapshot(null);
    setStatus("disconnected");
    setError(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      api,
      snapshot,
      error,
      isLaceInstalled,
      connect,
      disconnect
    }),
    [status, api, snapshot, error, isLaceInstalled, connect, disconnect]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
