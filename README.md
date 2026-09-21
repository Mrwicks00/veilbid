# veilbid

A sealed-bid commitment contract for [Midnight](https://midnight.network) — built for the **New Moon (Level 1)**
cycle of the monthly Midnight builder challenge.

**Deployed on Preview:** `0400eed09ee11423a976fb09750a76fb0ac7974ac04e797c6f3c203bdd750418`
(verifiable via the Preview indexer's `contractAction` query, or on a Midnight Preview block explorer)

## Initial product idea

Sealed-bid auctions are common in procurement, real estate, and collectibles, but running one honestly today means
trusting a middleman not to leak or front-run bids before the auction closes. veilbid explores what a sealed-bid
auction looks like when the chain itself enforces the seal: a bidder commits to an amount with a private witness,
and only a cryptographic commitment (not the amount, not their identity) touches the public ledger. When the
auction closes, bidders reveal — and the contract publicly discloses a bid's amount and bidder identity only if it
turns out to be the new highest, via an explicit `disclose()` call. Losing bids never have their amounts exposed at
all. The natural next step beyond this Level 1 scope is multi-bidder support (a `Map`-keyed ledger of commitments
instead of a single slot) so a real auction with many simultaneous participants can run end-to-end.

## Public state vs. private witness

Compact contracts draw a hard line between what is written to the public ledger (visible to anyone, forever) and
what stays as a private witness (known only to whoever supplies it, and never transmitted unless a circuit
explicitly discloses it). This contract uses both deliberately:

**Public ledger state** (`contract/src/sealed_bid.compact`):
- `sealedCommitment: Bytes<32>` — a hash commitment of the currently sealed bid. Anyone can see a bid exists and a
  commitment was made; nobody can recover the amount or bidder from it.
- `highestBid: Uint<64>` and `winnerId: Bytes<32>` — the amount and identity of the current highest bidder, but
  **only after** a winning reveal. They stay at their zero defaults for every bid that never becomes the winner.
- `bidsSubmitted: Counter` — a public count of how many bids have ever been sealed. Reveals activity, not content.

**Private witnesses** (`contract/src/witnesses.ts`):
- `bidAmount()`, `bidNonce()`, `bidderId()` — supplied locally by the bidder's own code. These values never appear
  on the ledger on their own.

The two circuits show the boundary in action:
- `submitSealedBid()` computes `persistentCommit(bidAmount(), bidNonce())` and writes only that hash to the ledger.
  The amount itself never leaves the caller's machine at this stage.
- `revealBid()` recomputes the same commitment and asserts it matches what was sealed earlier — proving the caller
  knew the value all along without ever having exposed it. Only if the revealed amount beats the current
  `highestBid` does the circuit call `disclose(bidAmount())` and `disclose(bidderId())` to deliberately publish
  those values. The Compact compiler enforces this: writing a witness-derived value (or even branching on a
  comparison involving one) to the ledger without an explicit `disclose()` is a compile error, not just a
  convention.

## Setup — run it locally

Prerequisites: Node.js 22+, Docker, and the [Compact toolchain](https://docs.midnight.network/getting-started/installation).

```bash
git clone <this-repo-url>
cd veilbid
npm install
```

### 1. Start the proof server

```bash
docker run -d --name midnight-proof-server -p 6300:6300 midnightntwrk/proof-server:8.1.0
```

### 2. Compile the contract

```bash
cd contract
npm run compact
```

This runs `compact compile src/sealed_bid.compact src/managed/sealed_bid`, producing the `managed/` directory
(compiled TypeScript contract wrapper, zkir circuits, and proving/verifying keys for both circuits).

### 3. Run the tests

```bash
npm test
```

Six tests cover: empty initial state, a commit that doesn't disclose the amount, disclosure on a winning reveal, a
higher bid overtaking the previous winner, a lower bid being correctly ignored, and a mismatched reveal being
rejected by the contract.

### 4. Deploy to Preview or Preprod

```bash
cd ../deploy
npm run preview   # or: npm run preprod
```

On first run this generates a fresh wallet seed (saved to a gitignored `deploy/.env`), prints the wallet's
unshielded address, and waits — fund that address from the network's faucet
(`https://midnight.network/test-faucet` for Preview, `https://faucet.preprod.midnight.network/` for Preprod). Once
funded, the script registers the NIGHT for DUST generation and deploys automatically, printing the contract
address.

## Screenshots

**Successful compile** — both circuits compiled (`revealBid`, `submitSealedBid`):

![compile output](docs/compile-output.png)

**Deployed to Preview** — funded wallet and the resulting contract address:

![deploy output](docs/deploy-output.png)

## Project structure

```
contract/
  src/sealed_bid.compact   — the Compact contract
  src/witnesses.ts         — private witness implementations
  src/managed/             — compiled circuits, keys, zkir (generated by `compact compile`)
  src/test/                — Vitest suite using the compact-runtime simulator
deploy/
  src/config.ts            — Preview/Preprod/local network endpoints
  src/wallet.ts            — wallet construction, sync, and provider wiring
  src/deploy.ts            — one-shot deploy entrypoint
```
