"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type FormField = {
  name: string
  label: string
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox"
  required?: boolean
  options?: string[]
}

export type FormDefinition = {
  id: string
  handle: string
  title: string
  description?: string | null
  fields: FormField[]
  enabled: boolean
}

export const getForm = async (
  handle: string
): Promise<FormDefinition | null> => {
  const next = { ...(await getCacheOptions("forms")) }
  return sdk.client
    .fetch<{ form: FormDefinition }>(`/store/forms/${handle}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ form }) => form)
    .catch(() => null)
}

export const submitForm = async (
  handle: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> => {
  try {
    await sdk.client.fetch(`/store/forms/${handle}/submissions`, {
      method: "POST",
      body: { data },
    })
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "submit failed" }
  }
}
