import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHAT_MODULE } from "../../../../../../modules/chat"
import ChatModuleService from "../../../../../../modules/chat/service"

// GET /admin/chat/conversations/:id/messages — list messages.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const service: ChatModuleService = req.scope.resolve(CHAT_MODULE)
  const messages = await service.listChatMessages(
    { conversation_id: id },
    { order: { created_at: "ASC" }, take: 500 }
  )
  res.json({ messages })
}

// POST /admin/chat/conversations/:id/messages — agent reply.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body ?? {}) as { body?: string }
  const service: ChatModuleService = req.scope.resolve(CHAT_MODULE)

  if (!body.body?.trim()) {
    return res.status(400).json({ message: "Message body is required" })
  }

  const message = await service.createChatMessages({
    conversation_id: id,
    sender_type: "agent",
    body: body.body.trim(),
  })
  await service.updateConversations({ id, last_message_at: new Date() })

  res.status(201).json({ message })
}
