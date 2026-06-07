import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHAT_MODULE } from "../../../../modules/chat"
import ChatModuleService from "../../../../modules/chat/service"

// GET /admin/chat/conversations — list conversations (most recent first).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ChatModuleService = req.scope.resolve(CHAT_MODULE)
  const conversations = await service.listConversations(
    {},
    { order: { last_message_at: "DESC" }, take: 200 }
  )
  res.json({ conversations })
}
