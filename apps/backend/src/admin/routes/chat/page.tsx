import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Container, Heading, Button, Text, Badge, Textarea } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

type Conversation = {
  id: string
  customer_name: string | null
  customer_email: string | null
  subject: string | null
  status: string
  last_message_at: string | null
}

type Message = {
  id: string
  sender_type: "customer" | "agent" | "system"
  body: string
  created_at: string
}

const ChatInboxPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadConversations = () =>
    fetch("/admin/chat/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => {})

  const loadMessages = (id: string) =>
    fetch(`/admin/chat/conversations/${id}/messages`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {})

  useEffect(() => {
    loadConversations()
    const t = setInterval(loadConversations, 6000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!activeId) return
    loadMessages(activeId)
    const t = setInterval(() => loadMessages(activeId), 4000)
    return () => clearInterval(t)
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendReply = async () => {
    const body = reply.trim()
    if (!body || !activeId || sending) return
    setSending(true)
    setReply("")
    await fetch(`/admin/chat/conversations/${activeId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    })
    await loadMessages(activeId)
    setSending(false)
  }

  return (
    <Container className="p-0">
      <div className="px-6 py-4 border-b">
        <Heading level="h2">即時客服 / Support Chat</Heading>
      </div>
      <div className="flex" style={{ height: 560 }}>
        {/* Conversation list */}
        <div className="w-1/3 border-r overflow-y-auto">
          {conversations.length === 0 && (
            <Text className="text-ui-fg-subtle p-4">尚無對話</Text>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`block w-full text-left px-4 py-3 border-b hover:bg-ui-bg-subtle ${
                activeId === c.id ? "bg-ui-bg-subtle" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <Text weight="plus" size="small">
                  {c.customer_name || c.customer_email || "訪客"}
                </Text>
                <Badge size="2xsmall" color={c.status === "open" ? "green" : "grey"}>
                  {c.status}
                </Badge>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle truncate">
                {c.subject || c.customer_email || c.id}
              </Text>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center">
              <Text className="text-ui-fg-subtle">選擇左側對話開始回覆</Text>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-2 bg-ui-bg-subtle">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-small-regular ${
                      m.sender_type === "agent"
                        ? "self-end bg-ui-bg-interactive text-ui-fg-on-color"
                        : "self-start bg-white border"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t flex gap-x-2">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="輸入回覆…"
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={sendReply} isLoading={sending} className="self-end">
                  回覆
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "即時客服",
  icon: ChatBubbleLeftRight,
})

export default ChatInboxPage
