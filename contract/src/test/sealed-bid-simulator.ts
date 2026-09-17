import {
  type CircuitContext,
  sampleContractAddress,
  createConstructorContext,
  createCircuitContext
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger
} from "../managed/sealed_bid/contract/index.js";
import { type SealedBidPrivateState, witnesses } from "../witnesses.js";

export class SealedBidSimulator {
  readonly contract: Contract<SealedBidPrivateState>;
  circuitContext: CircuitContext<SealedBidPrivateState>;

  constructor(privateState: SealedBidPrivateState) {
    this.contract = new Contract<SealedBidPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      createConstructorContext(privateState, "0".repeat(64))
    );
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      currentZswapLocalState,
      currentContractState,
      currentPrivateState
    );
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): SealedBidPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public setPrivateState(privateState: SealedBidPrivateState): void {
    this.circuitContext.currentPrivateState = privateState;
  }

  public submitSealedBid(): Ledger {
    this.circuitContext = this.contract.impureCircuits.submitSealedBid(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public revealBid(): Ledger {
    this.circuitContext = this.contract.impureCircuits.revealBid(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }
}
