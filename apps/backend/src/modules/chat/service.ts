import { MedusaService } from "@medusajs/framework/utils"
import Conversation from "./models/conversation"
import ChatMessage from "./models/message"

class ChatModuleService extends MedusaService({
  Conversation,
  ChatMessage,
}) {}

export default ChatModuleService
