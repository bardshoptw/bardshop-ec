import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CREDITS_MODULE } from "../../../../modules/credits"
import CreditsModuleService from "../../../../modules/credits/service"

// POST /admin/credits/topup — manually add credits to a customer (testing / support).
// body: { customer_id, amount, reason? }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as {
    customer_id?: string
    amount?: number
    reason?: string
  }
  const customerId = body.customer_id
  const amount = Number(body.amount)

  if (!customerId || !Number.isFinite(amount) || amount === 0) {
    return res
      .status(400)
      .json({ message: "customer_id and a non-zero amount are required" })
  }

  const service: CreditsModuleService = req.scope.resolve(CREDITS_MODULE)
  const result = await service.adjust(
    customerId,
    amount,
    amount > 0 ? "topup" : "adjust",
    body.reason ?? "admin top-up"
  )

  res.json({ customer_id: customerId, ...result })
}
