import { model } from "@medusajs/framework/utils"

/** One credit wallet per customer. `balance` is whole credits. */
const CreditWallet = model.define("credit_wallet", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  balance: model.number().default(0),
})

export default CreditWallet
