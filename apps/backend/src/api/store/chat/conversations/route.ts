import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHAT_MODULE } from "../../../../modules/chat"
import ChatModuleService from "../../../../modules/chat/service"

// POST /store/chat/conversations — start a new support conversation.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: ChatModuleService = req.scope.resolve(CHAT_MODULE)
  const body = (req.body ?? {}) as {
    name?: string
    email?: string
    subject?: string
    message?: string
  }

  const conversation = await service.createConversations({
    customer_name: body.name ?? null,
    customer_email: body.email ?? null,
    subject: body.subject ?? null,
    status: "open",
    last_message_at: new Date(),
  })

  // Optional first message from the customer.
  if (body.message?.trim()) {
    await service.createChatMessages({
      conversation_id: conversation.id,
      sender_type: "customer",
      body: body.message.trim(),
    })
  }

  res.status(201).json({ conversation })
}
