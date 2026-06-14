import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

// Adds TWD currency + a Taiwan region. Run: npx medusa exec ./src/scripts/add-tw-region.ts
export default async function addTwRegion({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const storeService = container.resolve(Modules.STORE)

  // 1. Ensure TWD is in the store's supported currencies.
  const [store] = await storeService.listStores()
  const currencies = (store.supported_currencies ?? []).map((c: any) => ({
    currency_code: c.currency_code,
    is_default: !!c.is_default,
  }))
  if (!currencies.find((c) => c.currency_code === "twd")) {
    currencies.push({ currency_code: "twd", is_default: false })
    // Ensure exactly one default currency survives the update.
    if (!currencies.some((c) => c.is_default)) {
      const def =
        currencies.find((c) => c.currency_code === "eur") || currencies[0]
      if (def) def.is_default = true
    }
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { supported_currencies: currencies },
      },
    })
    logger.info("Added TWD to store currencies")
  } else {
    logger.info("TWD already supported")
  }

  // 2. Create Taiwan region.
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })
  if (!regions.find((r: any) => r.name === "Taiwan")) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Taiwan",
            currency_code: "twd",
            countries: ["tw"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    logger.info("Created Taiwan (TWD) region")
  } else {
    logger.info("Taiwan region already exists")
  }

  // 3. Tax region for tw.
  const { data: tax } = await query.graph({
    entity: "tax_region",
    fields: ["country_code"],
  })
  if (!tax.find((t: any) => t.country_code === "tw")) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "tw", provider_id: "tp_system" }],
    })
  }
  logger.info("Taiwan region setup done")
}
