import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createCustomersWorkflow,
  createCustomerAddressesWorkflow,
} from "@medusajs/medusa/core-flows"
import * as fs from "fs"

// Batch-import customers from /tmp/customers.json (produced by the xlsx transform).
// Run: npx medusa exec ./src/scripts/import-customers.ts
export default async function importCustomers({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerService = container.resolve(Modules.CUSTOMER)

  const records: any[] = JSON.parse(
    fs.readFileSync("/tmp/customers.json", "utf8")
  )

  // Skip emails that already exist (idempotent re-runs).
  const existing = await customerService.listCustomers(
    {},
    { select: ["email"], take: null as any }
  )
  const seen = new Set(
    existing.map((c: any) => (c.email ?? "").toLowerCase())
  )
  const todo = records.filter((r) => !seen.has(r.email))
  logger.info(
    `Customers: ${records.length} in file, ${todo.length} new to import, ${
      records.length - todo.length
    } already exist`
  )

  const toCustomerData = (c: any) => ({
    email: c.email,
    first_name: c.first_name ?? undefined,
    phone: c.phone ?? undefined,
    metadata: c.metadata ?? undefined,
  })

  const createChunk = async (chunk: any[]) => {
    const { result } = await createCustomersWorkflow(container).run({
      input: { customersData: chunk.map(toCustomerData) },
    })
    const addresses: any[] = []
    result.forEach((cust: any, idx: number) => {
      const src = chunk[idx]
      if (src.addresses?.length) {
        src.addresses.forEach((a: any) =>
          addresses.push({ ...a, customer_id: cust.id })
        )
      }
    })
    if (addresses.length) {
      await createCustomerAddressesWorkflow(container).run({
        input: { addresses },
      })
    }
    return result.length
  }

  const BATCH = 500
  let created = 0
  let failed = 0
  for (let i = 0; i < todo.length; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH)
    try {
      created += await createChunk(chunk)
    } catch (e: any) {
      // Fall back to one-by-one for this chunk so a single bad row can't drop 500.
      logger.warn(`Batch ${i} failed (${e?.message}); retrying individually`)
      for (const rec of chunk) {
        try {
          created += await createChunk([rec])
        } catch (e2: any) {
          failed++
          logger.warn(`  skip ${rec.email}: ${e2?.message}`)
        }
      }
    }
    logger.info(`  progress: ${created}/${todo.length} (failed ${failed})`)
  }

  logger.info(`Customer import done: ${created} created, ${failed} failed`)
}
