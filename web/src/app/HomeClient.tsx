"use client";

// Must be the first import — see bindFetch.ts for why order matters here.
import "@/lib/bindFetch";
import { WalletProvider } from "@/contexts/WalletContext";
import { ContractProvider } from "@/contexts/ContractContext";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { SealStamp } from "@/components/SealStamp";
import { AuctionStatusBar } from "@/components/AuctionStatusBar";
import { BidPanel } from "@/components/BidPanel";
import { PublicLedgerPanel } from "@/components/PublicLedgerPanel";
import { PrivacyLedger } from "@/components/PrivacyLedger";
import { CONTRACT_ADDRESS, NETWORK_ID } from "@/lib/network";
import { shortHex } from "@/lib/bid";

export default function HomeClient() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-10 sm:px-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl italic text-ink-bright sm:text-4xl">veilbid</h1>
              <p className="mt-1 text-sm text-ink-dim">a sealed-bid auction, many bidders, one winner</p>
            </div>
            <WalletConnectButton />
          </header>

          <div className="mt-8 animate-ink-in">
            <SealStamp />
          </div>

          <div className="mt-2">
            <AuctionStatusBar />
          </div>

          <main className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="flex flex-col gap-6">
              <BidPanel />
              <PrivacyLedger />
            </div>
            <PublicLedgerPanel />
          </main>

          <footer className="mt-10 flex flex-col gap-2 border-t border-rule/60 pt-6 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
            <p>
              Contract on <span className="font-mono uppercase text-ink-bright">{NETWORK_ID}</span>:{" "}
              <span className="font-mono">0x{shortHex(CONTRACT_ADDRESS, 10, 8)}</span>
            </p>
            <p>
              Sealed-bid commitment contract in{" "}
              <a
                href="https://docs.midnight.network"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-rule underline-offset-2 hover:text-ink-bright"
              >
                Compact
              </a>{" "}
              for the Midnight builder challenge.
            </p>
          </footer>
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}
