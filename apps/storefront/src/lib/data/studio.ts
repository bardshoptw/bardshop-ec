"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type CreditState = {
  balance: number
  transactions: { id: string; delta: number; type: string; reason?: string; created_at: string }[]
}

export type StudioAsset = {
  id: string
  url: string
  kind?: string
  created_at: string
}

export async function getCredits(): Promise<CreditState> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return { balance: 0, transactions: [] }
  return sdk.client
    .fetch<CreditState>("/store/credits", { method: "GET", headers, cache: "no-store" })
    .catch(() => ({ balance: 0, transactions: [] }))
}

export async function getAssets(): Promise<StudioAsset[]> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return []
  return sdk.client
    .fetch<{ assets: StudioAsset[] }>("/store/ai/assets", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((r) => r.assets ?? [])
    .catch(() => [])
}

export async function runAiJob(input: {
  type: "generate" | "bg_remove" | "retouch" | "upscale"
  prompt?: string
  image_url?: string
}): Promise<{
  ok: boolean
  asset?: StudioAsset
  spent?: number
  error?: string
  insufficient?: boolean
}> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return { ok: false, error: "NOT_AUTHENTICATED" }
  try {
    const r = await sdk.client.fetch<{ asset: StudioAsset; spent: number }>(
      "/store/ai/jobs",
      { method: "POST", headers, body: input }
    )
    return { ok: true, asset: r.asset, spent: r.spent }
  } catch (e: any) {
    const msg = e?.message ?? "failed"
    const insufficient =
      e?.status === 402 || /INSUFFICIENT_CREDITS/i.test(JSON.stringify(e ?? ""))
    return { ok: false, error: msg, insufficient }
  }
}
