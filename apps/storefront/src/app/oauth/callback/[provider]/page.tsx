"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { completeProviderCallback, OAuthProvider } from "@lib/data/oauth"

// Locale-agnostic OAuth return page. Registered as the provider callback URL
// (excluded from the i18n middleware). Completes the session then sends the
// user into the localized account page.
export default function OAuthCallbackPage() {
  const params = useParams()
  const search = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const provider = params.provider as OAuthProvider
    const query: Record<string, string> = {}
    search.forEach((v, k) => {
      query[k] = v
    })
    completeProviderCallback(provider, query).then((res) => {
      if (res.ok) {
        window.location.href = "/account"
      } else {
        setError(res.error ?? "登入失敗")
      }
    })
  }, [params, search])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-y-3 p-8 text-center">
      {error ? (
        <>
          <p className="text-rose-500">登入失敗 / Login failed</p>
          <p className="text-ui-fg-subtle text-small-regular">{error}</p>
          <a href="/account" className="underline">
            返回登入
          </a>
        </>
      ) : (
        <p className="text-ui-fg-base">登入中… / Signing you in…</p>
      )}
    </div>
  )
}
