"use client";

import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { NETWORK_ID } from "./network";

/** Legacy fixed key some Lace builds still inject under. */
const LEGACY_LACE_KEY = "mnLace";

export type WalletSnapshot = {
  address: string;
  shieldedAddress: string;
};

const looksLikeLace = (wallet: InitialAPI): boolean =>
  wallet.rdns?.toLowerCase().includes("lace") || wallet.name?.toLowerCase().includes("lace");

/**
 * Finds Lace's Initial API under window.midnight, if the extension has injected it yet.
 *
 * Discovery has two live shapes in the wild: older/some current builds inject under the
 * fixed key `mnLace`, but the v4 DApp Connector spec instead has each wallet install under
 * its own unique key (a UUID in practice) and identify itself via `rdns`/`name` — so a
 * lookup that only checks `window.midnight.mnLace` misses those installs entirely. Check
 * the legacy key first, then fall back to scanning every injected wallet for one that
 * self-identifies as Lace.
 *
 * The extension injects slightly after page load, so callers should poll rather than
 * check once on mount.
 */
export function findLaceInitialApi(): InitialAPI | undefined {
  if (typeof window === "undefined" || !window.midnight) return undefined;
  const legacy = window.midnight[LEGACY_LACE_KEY];
  if (legacy) return legacy;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI => !!wallet && typeof wallet === "object" && looksLikeLace(wallet)
  );
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
