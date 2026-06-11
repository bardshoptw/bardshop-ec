import { MedusaService } from "@medusajs/framework/utils"
import CreditWallet from "./models/credit-wallet"
import CreditTransaction from "./models/credit-transaction"

class CreditsModuleService extends MedusaService({
  CreditWallet,
  CreditTransaction,
}) {
  // Find or create the customer's wallet.
  async ensureWallet(customerId: string) {
    const [existing] = await this.listCreditWallets({
      customer_id: customerId,
    })
    if (existing) return existing
    return await this.createCreditWallets({
      customer_id: customerId,
      balance: 0,
    })
  }

  // Atomically apply a balance change + write a ledger entry.
  // delta > 0 to add, < 0 to spend. Throws INSUFFICIENT_CREDITS if it would go negative.
  async adjust(
    customerId: string,
    delta: number,
    type: "topup" | "spend" | "refund" | "adjust",
    reason?: string,
    metadata?: Record<string, unknown>
  ) {
    const wallet = await this.ensureWallet(customerId)
    const newBalance = (wallet.balance ?? 0) + delta
    if (newBalance < 0) {
      throw new Error("INSUFFICIENT_CREDITS")
    }
    await this.updateCreditWallets({ id: wallet.id, balance: newBalance })
    await this.createCreditTransactions({
      wallet_id: wallet.id,
      delta,
      type,
      reason: reason ?? null,
      metadata: metadata ?? null,
    })
    return { balance: newBalance, wallet_id: wallet.id }
  }
}

export default CreditsModuleService
