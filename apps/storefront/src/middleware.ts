import { HttpTypes } from "@medusajs/types"
import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"

// Handles the [locale] segment: negotiation, prefixing, and the NEXT_LOCALE cookie.
const intlMiddleware = createMiddleware(routing)

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const { regions } = await response.json()

    if (!regions?.length) {
      return new Map<string, HttpTypes.StoreRegion>()
    }

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Resolve the best country code. URL country is at segment index 2 now
 * (after the [locale] segment): /{locale}/{country}/...
 */
function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>
) {
  const urlCountryCode = request.nextUrl.pathname.split("/")[2]?.toLowerCase()
  const cloudflareCountryCode = (
    request as { cf?: { country?: string } }
  ).cf?.country?.toLowerCase()
  const vercelCountryCode = request.headers
    .get("x-vercel-ip-country")
    ?.toLowerCase()

  if (urlCountryCode && regionMap.has(urlCountryCode)) return urlCountryCode
  if (cloudflareCountryCode && regionMap.has(cloudflareCountryCode))
    return cloudflareCountryCode
  if (vercelCountryCode && regionMap.has(vercelCountryCode))
    return vercelCountryCode
  if (regionMap.has(DEFAULT_REGION)) return DEFAULT_REGION
  return regionMap.keys().next().value as string | undefined
}

/**
 * Composed middleware: next-intl handles the [locale] prefix; we then ensure a
 * valid [countryCode] segment follows it, producing /{locale}/{country}/...
 */
export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl

  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  const segments = pathname.split("/")
  const maybeLocale = segments[1]?.toLowerCase()
  const matchedLocale = routing.locales.find(
    (l) => l.toLowerCase() === maybeLocale
  )

  // 1. No valid locale prefix → let next-intl negotiate & prepend it.
  //    (A follow-up request then gains the country segment below.)
  if (!matchedLocale) {
    return intlMiddleware(request)
  }

  // 2. Locale present → ensure a valid country segment follows it.
  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()
  const regionMap = await getRegionMap(cacheId)

  const urlCountry = segments[2]?.toLowerCase()
  const hasValidCountry = !!urlCountry && regionMap.has(urlCountry)

  if (hasValidCountry) {
    // Let next-intl set its locale cookie/headers, then attach our cache cookie.
    const response = intlMiddleware(request)
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  // 3. Locale present but country missing/invalid → redirect inserting country.
  const country = getCountryCode(request, regionMap) || DEFAULT_REGION
  const rest = segments.slice(2).join("/")
  const restPath = rest ? `/${rest}` : ""
  const redirectUrl = `${origin}/${matchedLocale}/${country}${restPath}${search}`

  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: [
    "/((?!api|oauth|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
