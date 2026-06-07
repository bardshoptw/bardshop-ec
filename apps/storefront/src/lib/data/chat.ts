"use server"

import { sdk } from "@lib/config"

export type ChatMessage = {
  id: string
  conversation_id: string
  sender_type: "customer" | "agent" | "system"
  body: string
  created_at: string
}

export async function createConversation(input: {
  name?: string
  email?: string
  subject?: string
  message?: string
}): Promise<{ id: string } | null> {
  return sdk.client
    .fetch<{ conversation: { id: string } }>("/store/chat/conversations", {
      method: "POST",
      body: input,
    })
    .then((r) => r.conversation)
    .catch(() => null)
}

export async function getChatMessages(id: string): Promise<ChatMessage[]> {
  return sdk.client
    .fetch<{ messages: ChatMessage[] }>(
      `/store/chat/conversations/${id}/messages`,
      { method: "GET", cache: "no-store" }
    )
    .then((r) => r.messages ?? [])
    .catch(() => [])
}

export async function sendChatMessage(
  id: string,
  body: string
): Promise<ChatMessage | null> {
  return sdk.client
    .fetch<{ message: ChatMessage }>(
      `/store/chat/conversations/${id}/messages`,
      { method: "POST", body: { body } }
    )
    .then((r) => r.message)
    .catch(() => null)
}
