"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag, setAuthToken } from "./cookies"

export type OAuthProvider = "google" | "line"

function decodeToken(token: string): Record<string, any> {
  try {
    const part = token.split(".")[1]
    const json = Buffer.from(
      part.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8")
    return JSON.parse(json)
  } catch {
    return {}
  }
}

// Step 1: get the provider's authorization URL to redirect the browser to.
export async function getProviderLoginUrl(
  provider: OAuthProvider
): Promise<{ location?: string; error?: string }> {
  try {
    const result: any = await sdk.auth.login("customer", provider, {})
    if (result && typeof result === "object" && result.location) {
      return { location: result.location }
    }
    return { error: "Provider did not return a redirect URL" }
  } catch (e: any) {
    return { error: e?.message ?? "login failed" }
  }
}

// Step 2: complete the OAuth callback (code+state) → set session, create
// customer on first login.
export async function completeProviderCallback(
  provider: OAuthProvider,
  query: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = (await sdk.auth.callback(
      "customer",
      provider,
      query
    )) as string
    await setAuthToken(token)

    const decoded = decodeToken(token)
    // No linked customer yet → create one from the auth-identity metadata.
    if (!decoded.actor_id) {
      const meta = decoded.user_metadata ?? {}
      const email = meta.email ?? decoded.email
      const headers = { ...(await getAuthHeaders()) }
      await sdk.store.customer.create(
        {
          email: email ?? `${provider}_${decoded.auth_identity_id}@example.com`,
          first_name: meta.given_name ?? meta.name ?? "",
          last_name: meta.family_name ?? "",
        } as any,
        {},
        headers
      )
      const refreshed = (await sdk.auth.refresh()) as string
      await setAuthToken(refreshed)
    }

    const tag = await getCacheTag("customers")
    revalidateTag(tag)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "callback failed" }
  }
}
