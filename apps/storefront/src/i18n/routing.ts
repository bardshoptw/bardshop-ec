import { defineRouting } from "next-intl/routing"

/**
 * UI language routing for the storefront. Locale lives in the URL
 * (e.g. /en/us/store, /zh-TW/tw/store) — best for SEO/GEO since each
 * language gets its own indexable URL with hreflang alternates.
 *
 * Note: this `locale` controls UI chrome language only. The `[countryCode]`
 * segment that follows still controls region/currency independently.
 */
export const routing = defineRouting({
  locales: ["en", "zh-TW", "ja", "ko"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
  },
})

export type Locale = (typeof routing.locales)[number]
