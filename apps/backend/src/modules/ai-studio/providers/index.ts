// AI provider abstraction. Uses fal.ai when FAL_KEY is set, otherwise a mock
// that returns placeholder images so the whole flow works without credentials.

export type AiOpType = "bg_remove" | "generate" | "retouch" | "upscale"

export type AiInput = { prompt?: string; image_url?: string }

// Credit cost per operation (adjust freely).
const COSTS: Record<AiOpType, number> = {
  bg_remove: 1,
  generate: 5,
  retouch: 3,
  upscale: 2,
}

export function creditCost(type: AiOpType): number {
  return COSTS[type] ?? 1
}

export function activeProviderName(): "fal" | "mock" {
  return process.env.FAL_KEY ? "fal" : "mock"
}

export async function runAi(
  type: AiOpType,
  input: AiInput
): Promise<{ url: string }> {
  if (process.env.FAL_KEY) {
    return runFal(type, input)
  }
  return runMock(type, input)
}

// --- Mock: deterministic placeholder images (no external creds) ---
function runMock(type: AiOpType, input: AiInput): Promise<{ url: string }> {
  const seed = encodeURIComponent(
    (input.prompt || input.image_url || type).slice(0, 24) || type
  )
  const size = type === "upscale" ? "1600/1600" : "1024/1024"
  return Promise.resolve({
    url: `https://picsum.photos/seed/${seed}-${type}/${size}`,
  })
}

// --- fal.ai adapter (only used when FAL_KEY present) ---
const FAL_MODELS: Record<AiOpType, string> = {
  generate: "fal-ai/flux/schnell",
  bg_remove: "fal-ai/imageutils/rembg",
  retouch: "fal-ai/flux/dev/image-to-image",
  upscale: "fal-ai/esrgan",
}

async function runFal(
  type: AiOpType,
  input: AiInput
): Promise<{ url: string }> {
  const model = FAL_MODELS[type]
  const payload: Record<string, unknown> =
    type === "generate"
      ? { prompt: input.prompt, image_size: "square_hd" }
      : type === "retouch"
      ? { prompt: input.prompt, image_url: input.image_url }
      : { image_url: input.image_url }

  const resp = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => "")
    throw new Error(`fal ${type} failed: ${resp.status} ${text.slice(0, 200)}`)
  }

  const data: any = await resp.json()
  const url =
    data?.images?.[0]?.url ?? data?.image?.url ?? data?.url ?? null
  if (!url) throw new Error(`fal ${type}: no image url in response`)
  return { url }
}
