import { AccountUpdateForest, method, PublicKey, TokenContractV2, UInt64 } from 'o1js';

export class MinaToken extends TokenContractV2 {
  SYMBOL = "TOKEN"
  INITIAL_ACCOUNT: PublicKey
  INITIAL_SUPPLY = 0n

  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }

  @method async init() {
    super.init();

    this.account.tokenSymbol.set(this.SYMBOL);

    if (this.INITIAL_SUPPLY) {
      this.internal.mint({
        address: this.INITIAL_ACCOUNT ?? this.address,
        amount: UInt64.from(this.INITIAL_SUPPLY),
      })
    }
  }
}
