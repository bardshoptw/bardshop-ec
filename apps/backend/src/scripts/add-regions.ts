import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Adds a United States (USD) sales region. Product variants already carry USD
 * prices from the initial seed, so this region works immediately — switching
 * the storefront country to "us" shows prices in USD.
 *
 * Run with: npx medusa exec ./src/scripts/add-regions.ts
 * Safe to re-run: skips regions/tax-regions that already exist.
 */
export default async function addRegions({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })
  const existingNames = new Set(existingRegions.map((r: any) => r.name))

  const usCountries = ["us", "ca"]

  if (existingNames.has("United States")) {
    logger.info("Region 'United States' already exists — skipping.")
    return
  }

  logger.info("Creating United States (USD) region...")
  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United States",
          currency_code: "usd",
          countries: usCountries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })

  // Tax regions (ignore ones already present)
  const { data: existingTax } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })
  const existingTaxCountries = new Set(
    existingTax.map((t: any) => t.country_code)
  )
  const taxToCreate = usCountries.filter((c) => !existingTaxCountries.has(c))
  if (taxToCreate.length) {
    await createTaxRegionsWorkflow(container).run({
      input: taxToCreate.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    })
  }

  logger.info("Finished adding United States region.")
}
