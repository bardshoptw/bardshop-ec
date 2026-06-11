import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CREDITS_MODULE } from "../../../modules/credits"
import CreditsModuleService from "../../../modules/credits/service"

// GET /admin/credits — list credit wallets.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: CreditsModuleService = req.scope.resolve(CREDITS_MODULE)
  const wallets = await service.listCreditWallets(
    {},
    { order: { balance: "DESC" }, take: 200 }
  )
  res.json({ wallets })
}
