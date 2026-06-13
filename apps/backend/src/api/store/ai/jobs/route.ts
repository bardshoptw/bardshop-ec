import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_STUDIO_MODULE } from "../../../../modules/ai-studio"
import AiStudioModuleService from "../../../../modules/ai-studio/service"
import { CREDITS_MODULE } from "../../../../modules/credits"
import CreditsModuleService from "../../../../modules/credits/service"
import {
  runAi,
  creditCost,
  AiOpType,
} from "../../../../modules/ai-studio/providers"

const VALID: AiOpType[] = ["bg_remove", "generate", "retouch", "upscale"]

// GET /store/ai/jobs — the customer's recent jobs.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) return res.status(401).json({ message: "Not authenticated" })
  const ai: AiStudioModuleService = req.scope.resolve(AI_STUDIO_MODULE)
  const jobs = await ai.listAiJobs(
    { customer_id: customerId },
    { order: { created_at: "DESC" }, take: 50 }
  )
  res.json({ jobs })
}

// POST /store/ai/jobs — run an AI operation: deduct credits, call provider,
// save the result as an asset. Refunds credits if the provider fails.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) return res.status(401).json({ message: "Not authenticated" })

  const body = (req.body ?? {}) as {
    type?: AiOpType
    prompt?: string
    image_url?: string
  }
  const type = body.type as AiOpType
  if (!VALID.includes(type)) {
    return res.status(400).json({ message: `type must be one of ${VALID.join(", ")}` })
  }
  if (type === "generate" && !body.prompt?.trim()) {
    return res.status(400).json({ message: "prompt is required for generate" })
  }
  if (type !== "generate" && !body.image_url) {
    return res.status(400).json({ message: "image_url is required" })
  }

  const cost = creditCost(type)
  const credits: CreditsModuleService = req.scope.resolve(CREDITS_MODULE)
  const ai: AiStudioModuleService = req.scope.resolve(AI_STUDIO_MODULE)

  // 1. Deduct credits up front.
  try {
    await credits.adjust(customerId, -cost, "spend", `ai:${type}`)
  } catch (e: any) {
    if (e?.message === "INSUFFICIENT_CREDITS") {
      return res
        .status(402)
        .json({ message: "INSUFFICIENT_CREDITS", required: cost })
    }
    throw e
  }

  // 2. Create job, run provider.
  const job = await ai.createAiJobs({
    customer_id: customerId,
    type,
    status: "processing",
    prompt: body.prompt ?? null,
    input_url: body.image_url ?? null,
    credits_cost: cost,
  })

  try {
    const { url } = await runAi(
      type,
      {
        prompt: body.prompt,
        image_url: body.image_url,
      },
      req.scope
    )
    await ai.updateAiJobs({ id: job.id, status: "completed", output_url: url })
    const asset = await ai.createAssets({
      customer_id: customerId,
      url,
      kind: type,
      job_id: job.id,
    })
    return res
      .status(201)
      .json({ job: { ...job, status: "completed", output_url: url }, asset, spent: cost })
  } catch (err: any) {
    // 3. Refund on failure.
    await credits.adjust(customerId, cost, "refund", `ai-failed:${type}`)
    await ai.updateAiJobs({
      id: job.id,
      status: "failed",
      error: (err?.message ?? "unknown").slice(0, 300),
    })
    return res
      .status(502)
      .json({ message: "AI operation failed (credits refunded)", error: err?.message })
  }
}
