import { model } from "@medusajs/framework/utils"

/** Ledger entry. `delta` is +topup/-spend etc. */
const CreditTransaction = model.define("credit_transaction", {
  id: model.id().primaryKey(),
  wallet_id: model.text(),
  delta: model.number(),
  type: model.enum(["topup", "spend", "refund", "adjust"]),
  reason: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default CreditTransaction
