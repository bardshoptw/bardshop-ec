import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"

type ProductSchemaProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

/**
 * Emits Product + Offer JSON-LD structured data for a product detail page.
 *
 * This is a primary GEO / AI-SEO signal: AI crawlers and search engines trust
 * facts declared in schema.org JSON-LD more than the same facts in prose, so
 * price, availability, brand and images here make the product eligible for
 * rich results and AI recommendation/agentic-commerce surfaces.
 *
 * Prices use Medusa v2 `calculated_amount`, which is already in major currency
 * units (e.g. 10 = €10) — do NOT divide by 100.
 */
const ProductSchema = ({ product, region, countryCode }: ProductSchemaProps) => {
  if (!product?.id) {
    return null
  }

  const baseUrl = getBaseURL()
  const productUrl = `${baseUrl}/${countryCode}/products/${product.handle}`

  const images =
    product.images?.map((img) => img.url).filter(Boolean) ??
    (product.thumbnail ? [product.thumbnail] : [])

  const variants = product.variants ?? []

  const offers = variants
    .filter((v) => v.calculated_price?.calculated_amount != null)
    .map((v) => {
      const inStock =
        v.manage_inventory === false ||
        v.allow_backorder === true ||
        (v.inventory_quantity ?? 0) > 0

      return {
        "@type": "Offer",
        sku: v.sku ?? undefined,
        price: v.calculated_price!.calculated_amount,
        priceCurrency:
          v.calculated_price?.currency_code?.toUpperCase() ??
          region.currency_code?.toUpperCase(),
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: productUrl,
      }
    })

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    url: productUrl,
    ...(product.id ? { productID: product.id } : {}),
    ...(images.length ? { image: images } : {}),
    brand: {
      "@type": "Brand",
      name: product.collection?.title || "Medusa Store",
    },
    ...(offers.length ? { offers } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default ProductSchema
