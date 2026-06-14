import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"

// Imports Shopline products from /tmp/products.json (built by build-products.js).
// Idempotent via external_id (skips already-imported). Run:
//   npx medusa exec ./src/scripts/import-products.ts
export default async function importProducts({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const all = JSON.parse(fs.readFileSync("/tmp/products.json", "utf8"))

  // Resolve default sales channel + shipping profile.
  const { data: scs } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const sc = scs.find((s: any) => /default/i.test(s.name)) || scs[0]
  const { data: sps } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })
  const sp = sps[0]
  logger.info(`sales_channel=${sc?.id} shipping_profile=${sp?.id}`)

  // Skip products already imported (by external_id).
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["external_id"],
    pagination: { take: 10000 },
  })
  const have = new Set(
    existing.map((p: any) => p.external_id).filter(Boolean)
  )

  const todo = all
    .filter((p: any) => !have.has(p.external_id))
    .map((p: any) => ({
      ...p,
      shipping_profile_id: sp?.id,
      sales_channels: sc ? [{ id: sc.id }] : undefined,
    }))

  logger.info(`to import: ${todo.length} / ${all.length} (skipped ${all.length - todo.length} existing)`)

  const BATCH = 10
  let created = 0,
    failed = 0
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH)
    try {
      await createProductsWorkflow(container).run({ input: { products: batch } })
      created += batch.length
    } catch (e: any) {
      // Fallback: one at a time so one bad product doesn't sink the batch.
      for (const p of batch) {
        try {
          await createProductsWorkflow(container).run({
            input: { products: [p] },
          })
          created++
        } catch (e2: any) {
          failed++
          logger.warn(`fail ${p.handle}: ${(e2?.message || "").slice(0, 120)}`)
        }
      }
    }
    if ((i / BATCH) % 3 === 0)
      logger.info(`progress ${created + failed}/${todo.length} (failed ${failed})`)
  }
  logger.info(`Product import done: ${created} created, ${failed} failed`)
}
