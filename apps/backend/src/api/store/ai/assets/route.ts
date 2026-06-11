import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_STUDIO_MODULE } from "../../../../modules/ai-studio"
import AiStudioModuleService from "../../../../modules/ai-studio/service"

// GET /store/ai/assets — the customer's saved asset library.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) return res.status(401).json({ message: "Not authenticated" })
  const ai: AiStudioModuleService = req.scope.resolve(AI_STUDIO_MODULE)
  const assets = await ai.listAssets(
    { customer_id: customerId },
    { order: { created_at: "DESC" }, take: 100 }
  )
  res.json({ assets })
}
