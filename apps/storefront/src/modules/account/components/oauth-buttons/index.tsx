"use client"

import { useState } from "react"
import { getProviderLoginUrl, OAuthProvider } from "@lib/data/oauth"

const PROVIDERS: { id: OAuthProvider; label: string; className: string }[] = [
  {
    id: "google",
    label: "使用 Google 登入",
    className: "border border-ui-border-base bg-white text-ui-fg-base",
  },
  {
    id: "line",
    label: "使用 LINE 登入",
    className: "bg-[#06C755] text-white border border-[#06C755]",
  },
]

const OAuthButtons = () => {
  const [loading, setLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (provider: OAuthProvider) => {
    setLoading(provider)
    setError(null)
    const res = await getProviderLoginUrl(provider)
    if (res.location) {
      window.location.href = res.location
    } else {
      setError(res.error ?? "登入失敗")
      setLoading(null)
    }
  }

  return (
    <div className="w-full flex flex-col gap-y-2 mt-6">
      <div className="flex items-center gap-x-3 text-ui-fg-muted text-small-regular">
        <span className="h-px flex-1 bg-ui-border-base" />
        或
        <span className="h-px flex-1 bg-ui-border-base" />
      </div>
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => handleClick(p.id)}
          disabled={loading !== null}
          className={`w-full h-10 rounded-md text-small-regular font-medium disabled:opacity-60 ${p.className}`}
        >
          {loading === p.id ? "前往登入中…" : p.label}
        </button>
      ))}
      {error && (
        <p className="text-rose-500 text-small-regular text-center">{error}</p>
      )}
    </div>
  )
}

export default OAuthButtons
