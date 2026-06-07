import { model } from "@medusajs/framework/utils"

/** A single chat message within a conversation. */
const ChatMessage = model.define("chat_message", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  sender_type: model.enum(["customer", "agent", "system"]),
  body: model.text(),
})

export default ChatMessage
