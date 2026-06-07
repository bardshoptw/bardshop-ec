import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  createCustomersWorkflow,
  createCustomerAddressesWorkflow,
} from "@medusajs/medusa/core-flows"
import { parseCSV } from "../../../../lib/csv"

type IncomingCustomer = {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  metadata?: Record<string, unknown>
  addresses?: Record<string, unknown>[]
}

// POST /admin/import/:resource  — body: JSON array/object or CSV text.
// Currently implements `customers` (email-dedup upsert). Products should use
// Medusa's built-in product import (importProductsWorkflow / admin Import UI).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { resource } = req.params

  if (resource === "products") {
    return res.status(400).json({
      message:
        "Use Medusa's built-in product import (Admin → Products → Import, or importProductsWorkflow).",
    })
  }
  if (resource !== "customers") {
    return res
      .status(404)
      .json({ message: `Unsupported import resource '${resource}'` })
  }

  // Accept either JSON ({customers:[...]} / [...]) or raw CSV string body.
  let records: IncomingCustomer[] = []
  const body: any = req.body
  if (typeof body === "string") {
    records = parseCSV(body) as unknown as IncomingCustomer[]
  } else if (Array.isArray(body)) {
    records = body
  } else if (Array.isArray(body?.customers)) {
    records = body.customers
  } else {
    return res.status(400).json({
      message: "Provide a JSON array, {customers:[...]}, or CSV text body",
    })
  }

  const customerService = req.scope.resolve(Modules.CUSTOMER)

  const result = { created: 0, updated: 0, skipped: 0, errors: [] as any[] }

  for (const rec of records) {
    const email = (rec.email ?? "").trim().toLowerCase()
    if (!email) {
      result.skipped++
      result.errors.push({ email: rec.email, error: "missing email" })
      continue
    }
    try {
      const existing = await customerService.listCustomers({ email })
      const fields = {
        first_name: rec.first_name ?? null,
        last_name: rec.last_name ?? null,
        phone: rec.phone ?? null,
        metadata: rec.metadata ?? undefined,
      }

      let customerId: string
      if (existing.length) {
        customerId = existing[0].id
        await customerService.updateCustomers({ id: customerId, ...fields })
        result.updated++
      } else {
        const { result: created } = await createCustomersWorkflow(
          req.scope
        ).run({
          input: { customersData: [{ email, ...fields }] },
        })
        customerId = created[0].id
        result.created++
      }

      if (rec.addresses?.length) {
        await createCustomerAddressesWorkflow(req.scope).run({
          input: {
            addresses: rec.addresses.map((a) => ({
              ...(a as object),
              customer_id: customerId,
            })) as any,
          },
        })
      }
    } catch (e: any) {
      result.skipped++
      result.errors.push({ email, error: e?.message ?? "unknown" })
    }
  }

  res.json(result)
}
