import { model } from "@medusajs/framework/utils"

/** An AI image operation requested by a customer. */
const AiJob = model.define("ai_job", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  type: model.enum(["bg_remove", "generate", "retouch", "upscale"]),
  status: model
    .enum(["pending", "processing", "completed", "failed"])
    .default("pending"),
  prompt: model.text().nullable(),
  input_url: model.text().nullable(),
  output_url: model.text().nullable(),
  credits_cost: model.number().default(0),
  error: model.text().nullable(),
})

export default AiJob
