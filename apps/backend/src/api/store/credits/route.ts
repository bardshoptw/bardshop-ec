import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CREDITS_MODULE } from "../../../modules/credits"
import CreditsModuleService from "../../../modules/credits/service"

// GET /store/credits — the logged-in customer's balance + recent transactions.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  const service: CreditsModuleService = req.scope.resolve(CREDITS_MODULE)
  const wallet = await service.ensureWallet(customerId)
  const transactions = await service.listCreditTransactions(
    { wallet_id: wallet.id },
    { order: { created_at: "DESC" }, take: 50 }
  )

  res.json({ balance: wallet.balance, transactions })
}
