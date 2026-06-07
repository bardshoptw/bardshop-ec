"use client"

import { ChatBubbleLeftRight, XMark } from "@medusajs/icons"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import {
  ChatMessage,
  createConversation,
  getChatMessages,
  sendChatMessage,
} from "@lib/data/chat"

const STORAGE_KEY = "chat_conversation_id"

const ChatWidget = () => {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load saved conversation id.
  useEffect(() => {
    setConvId(localStorage.getItem(STORAGE_KEY))
  }, [])

  // Poll messages while open.
  useEffect(() => {
    if (!open || !convId) return
    let active = true
    const load = async () => {
      const msgs = await getChatMessages(convId)
      if (active) setMessages(msgs)
    }
    load()
    const timer = setInterval(load, 4000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [open, convId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const body = input.trim()
    if (!body || sending) return
    setSending(true)
    setInput("")

    if (!convId) {
      const conv = await createConversation({ message: body })
      if (conv) {
        localStorage.setItem(STORAGE_KEY, conv.id)
        setConvId(conv.id)
        const msgs = await getChatMessages(conv.id)
        setMessages(msgs)
      }
    } else {
      // optimistic
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          conversation_id: convId,
          sender_type: "customer",
          body,
          created_at: new Date().toISOString(),
        },
      ])
      await sendChatMessage(convId, body)
      const msgs = await getChatMessages(convId)
      setMessages(msgs)
    }
    setSending(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[340px] max-w-[calc(100vw-2.5rem)] h-[460px] bg-white rounded-xl shadow-2xl border border-ui-border-base flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-ui-bg-base border-b border-ui-border-base">
            <span className="font-medium">{t("Chat.title")}</span>
            <button onClick={() => setOpen(false)} aria-label="close">
              <XMark />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-y-2 bg-ui-bg-subtle">
            {messages.length === 0 && (
              <p className="text-ui-fg-subtle text-small-regular text-center mt-4">
                {t("Chat.greeting")}
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-small-regular ${
                  m.sender_type === "customer"
                    ? "self-end bg-ui-bg-interactive text-ui-fg-on-color"
                    : "self-start bg-white border border-ui-border-base"
                }`}
              >
                {m.body}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-2 border-t border-ui-border-base flex gap-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("Chat.placeholder")}
              className="flex-1 border border-ui-border-base rounded-md px-3 py-2 text-small-regular"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-3 py-2 rounded-md bg-ui-button-inverted text-ui-fg-on-inverted text-small-regular disabled:opacity-50"
            >
              {t("Chat.send")}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-full bg-ui-button-inverted text-ui-fg-on-inverted shadow-xl flex items-center justify-center hover:opacity-90"
        aria-label={t("Chat.title")}
      >
        {open ? <XMark /> : <ChatBubbleLeftRight />}
      </button>
    </div>
  )
}

export default ChatWidget
