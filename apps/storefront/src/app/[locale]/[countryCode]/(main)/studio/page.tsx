import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { retrieveCustomer } from "@lib/data/customer"
import { getCredits, getAssets } from "@lib/data/studio"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StudioClient from "@modules/studio/components/studio-client"

export const metadata: Metadata = {
  title: "AI Studio | Medusa Store",
}

export default async function StudioPage() {
  const t = await getTranslations()
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return (
      <div className="content-container py-16 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">{t("Studio.title")}</h1>
        <p className="text-ui-fg-subtle">{t("Studio.loginRequired")}</p>
        <LocalizedClientLink
          href="/account"
          className="text-ui-fg-interactive underline w-fit"
        >
          {t("Nav.account")}
        </LocalizedClientLink>
      </div>
    )
  }

  const [credits, assets] = await Promise.all([getCredits(), getAssets()])

  return (
    <div className="content-container py-12 flex flex-col gap-y-6">
      <h1 className="text-2xl-semi">{t("Studio.title")}</h1>
      <StudioClient
        initialBalance={credits.balance}
        initialAssets={assets}
        customerEmail={customer.email ?? undefined}
      />
    </div>
  )
}
