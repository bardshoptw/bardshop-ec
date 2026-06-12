"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "zh-TW", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
]

// Compact locale dropdown for the top nav. Swaps the leading [locale] URL segment.
const NavLocaleSwitcher = () => {
  const activeLocale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const segments = pathname.split("/")
    segments[1] = e.target.value
    const next = segments.join("/") || "/"
    startTransition(() => router.push(next))
  }

  return (
    <select
      value={
        LOCALES.find((l) => l.code.toLowerCase() === activeLocale.toLowerCase())
          ?.code ?? "en"
      }
      onChange={handleChange}
      disabled={isPending}
      aria-label="Language"
      className="bg-transparent text-small-regular hover:text-ui-fg-base cursor-pointer outline-none"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  )
}

export default NavLocaleSwitcher
