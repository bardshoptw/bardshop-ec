import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHAT_MODULE } from "../../../../../../modules/chat"
import ChatModuleService from "../../../../../../modules/chat/service"

// GET /store/chat/conversations/:id/messages — poll messages (ASC).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const service: ChatModuleService = req.scope.resolve(CHAT_MODULE)
  const messages = await service.listChatMessages(
    { conversation_id: id },
    { order: { created_at: "ASC" }, take: 500 }
  )
  res.json({ messages })
}

// POST /store/chat/conversations/:id/messages — customer sends a message.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body ?? {}) as { body?: string }
  const service: ChatModuleService = req.scope.resolve(CHAT_MODULE)

  if (!body.body?.trim()) {
    return res.status(400).json({ message: "Message body is required" })
  }

  const message = await service.createChatMessages({
    conversation_id: id,
    sender_type: "customer",
    body: body.body.trim(),
  })
  await service.updateConversations({ id, last_message_at: new Date() })

  res.status(201).json({ message })
}
