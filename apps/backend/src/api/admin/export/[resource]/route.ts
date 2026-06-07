import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { toCSV } from "../../../../lib/csv"

// Reusable data export. GET /admin/export/:resource?format=csv|json&limit=&offset=
const RESOURCES: Record<string, { entity: string; fields: string[] }> = {
  products: {
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "status",
      "subtitle",
      "description",
      "thumbnail",
      "external_id",
      "categories.name",
      "variants.title",
      "variants.sku",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
  },
  customers: {
    entity: "customer",
    fields: [
      "id",
      "email",
      "first_name",
      "last_name",
      "phone",
      "has_account",
      "created_at",
      "metadata",
      "addresses.first_name",
      "addresses.last_name",
      "addresses.address_1",
      "addresses.address_2",
      "addresses.city",
      "addresses.province",
      "addresses.postal_code",
      "addresses.country_code",
      "addresses.phone",
    ],
  },
  orders: {
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "status",
      "currency_code",
      "total",
      "created_at",
    ],
  },
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { resource } = req.params
  const cfg = RESOURCES[resource]
  if (!cfg) {
    return res.status(404).json({
      message: `Unknown resource '${resource}'. Use one of: ${Object.keys(
        RESOURCES
      ).join(", ")}`,
    })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const limit = Math.min(Number(req.query.limit ?? 1000), 5000)
  const offset = Number(req.query.offset ?? 0)

  const { data } = await query.graph({
    entity: cfg.entity,
    fields: cfg.fields,
    pagination: { take: limit, skip: offset },
  })

  const format = (req.query.format as string) ?? "json"
  if (format === "csv") {
    const csv = toCSV(data as Record<string, unknown>[])
    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${resource}-export.csv"`
    )
    return res.send(csv)
  }

  res.json({ [resource]: data, count: data.length, limit, offset })
}
