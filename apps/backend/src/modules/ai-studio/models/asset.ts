import { model } from "@medusajs/framework/utils"

/** A produced image saved to the customer's asset library. */
const Asset = model.define("ai_asset", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  url: model.text(),
  kind: model.text().nullable(),
  job_id: model.text().nullable(),
})

export default Asset
