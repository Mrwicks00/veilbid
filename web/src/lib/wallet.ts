"use client";

import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { NETWORK_ID } from "./network";

export const LACE_KEY = "mnLace";

export type WalletSnapshot = {
  address: string;
  shieldedAddress: string;
};

/**
 * Finds Lace's Initial API under window.midnight, if the extension has injected it yet.
 * The extension injects slightly after page load, so callers should poll rather than
 * check once on mount.
 */
export function findLaceInitialApi(): InitialAPI | undefined {
  if (typeof window === "undefined" || !window.midnight) return undefined;
  return window.midnight[LACE_KEY];
}

/**
 * Connects to Lace. Must be called synchronously from within a real user click handler —
 * any await, setTimeout, or interval before this call causes the browser to block the
 * wallet's authorization popup as an unrequested one.
 */
export async function connectLace(): Promise<{ api: ConnectedAPI; snapshot: WalletSnapshot }> {
  const initialApi = findLaceInitialApi();
  if (!initialApi) {
    throw new Error(
      "Lace wallet not found. Install the Lace browser extension and refresh this page."
    );
  }

  const api = await initialApi.connect(NETWORK_ID);
  const status = await api.getConnectionStatus();
  if (status.status !== "connected") {
    throw new Error("Lace did not authorize the connection.");
  }
  if (status.networkId.toLowerCase() !== NETWORK_ID.toLowerCase()) {
    throw new Error(
      `Lace is connected to "${status.networkId}", but this app expects "${NETWORK_ID}". Switch networks in Lace and reconnect.`
    );
  }

  const [{ shieldedAddress }, { unshieldedAddress }] = await Promise.all([
    api.getShieldedAddresses(),
    api.getUnshieldedAddress()
  ]);

  return { api, snapshot: { address: unshieldedAddress, shieldedAddress } };
}
