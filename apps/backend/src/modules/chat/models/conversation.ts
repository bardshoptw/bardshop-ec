import { model } from "@medusajs/framework/utils"

/** A support conversation between a customer and the store's agents. */
const Conversation = model.define("conversation", {
  id: model.id().primaryKey(),
  customer_name: model.text().nullable(),
  customer_email: model.text().nullable(),
  subject: model.text().nullable(),
  status: model.enum(["open", "closed"]).default("open"),
  last_message_at: model.dateTime().nullable(),
})

export default Conversation
