import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

// Deletes all imported (external_id) products so the import can be re-run cleanly.
// Run: npx medusa exec ./src/scripts/delete-shopline-products.ts
export default async function deleteShopline({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "external_id"],
    pagination: { take: 10000 },
  })
  const ids = data.filter((p: any) => p.external_id).map((p: any) => p.id)
  for (let i = 0; i < ids.length; i += 50) {
    await deleteProductsWorkflow(container).run({
      input: { ids: ids.slice(i, i + 50) },
    })
  }
  logger.info(`Deleted ${ids.length} imported products`)
}
