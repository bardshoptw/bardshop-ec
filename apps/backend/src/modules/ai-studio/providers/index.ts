// AI provider abstraction.
//  - generate/retouch/upscale → fal.ai (FLUX) when FAL_KEY set
//  - bg_remove → Photoroom when PHOTOROOM_API_KEY set (uploads result to file module)
//  - falls back to fal, then to a mock that returns placeholder images
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

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

export function activeProviderName(): string {
  const gen = process.env.FAL_KEY ? "fal" : "mock"
  const bg = process.env.PHOTOROOM_API_KEY
    ? "photoroom"
    : process.env.FAL_KEY
    ? "fal"
    : "mock"
  return `generate:${gen}, bg_remove:${bg}`
}

export async function runAi(
  type: AiOpType,
  input: AiInput,
  container?: any
): Promise<{ url: string }> {
  // Background removal prefers Photoroom (returns a file we upload for a URL).
  if (type === "bg_remove" && process.env.PHOTOROOM_API_KEY && container) {
    return runPhotoroom(input, container)
  }
  if (process.env.FAL_KEY) {
    return runFal(type, input)
  }
  return runMock(type, input)
}

// --- Photoroom adapter: remove background, upload result, return its URL ---
async function runPhotoroom(
  input: AiInput,
  container: any
): Promise<{ url: string }> {
  if (!input.image_url) throw new Error("image_url is required for bg_remove")

  const src = await fetch(input.image_url)
  if (!src.ok) throw new Error(`could not fetch source image (${src.status})`)
  const srcBuf = Buffer.from(await src.arrayBuffer())

  const form = new FormData()
  form.append("image_file", new Blob([srcBuf]), "input.png")

  const resp = await fetch("https://sdk.photoroom.com/v1/segment", {
    method: "POST",
    headers: { "x-api-key": process.env.PHOTOROOM_API_KEY as string },
    body: form,
  })
  if (!resp.ok) {
    const t = await resp.text().catch(() => "")
    throw new Error(`photoroom failed: ${resp.status} ${t.slice(0, 200)}`)
  }

  const outBase64 = Buffer.from(await resp.arrayBuffer()).toString("base64")
  const { result } = await uploadFilesWorkflow(container).run({
    input: {
      files: [
        {
          filename: `bg-removed-${Date.now()}.png`,
          mimeType: "image/png",
          content: outBase64,
          access: "public",
        },
      ],
    },
  })
  const url = (result as any)?.[0]?.url
  if (!url) throw new Error("photoroom: upload returned no url")
  return { url }
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
// Models chosen for quality: FLUX.1 dev for generation, BiRefNet for cutouts.
const FAL_MODELS: Record<AiOpType, string> = {
  generate: "fal-ai/flux/dev",
  bg_remove: "fal-ai/birefnet",
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
      ? {
          prompt: input.prompt,
          image_size: "square_hd",
          num_images: 1,
          enable_safety_checker: true,
        }
      : type === "retouch"
      ? { prompt: input.prompt, image_url: input.image_url, strength: 0.85 }
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
