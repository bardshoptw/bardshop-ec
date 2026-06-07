"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

type LocaleOption = { code: string; label: string }

// UI interface languages (next-intl, URL-based). Distinct from the Medusa
// content locale used for translated product copy.
const LOCALES: LocaleOption[] = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
]

const LocaleSwitcher = () => {
  const activeLocale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()

  const current =
    LOCALES.find((l) => l.code.toLowerCase() === activeLocale.toLowerCase()) ??
    LOCALES[0]

  const handleChange = (option: LocaleOption) => {
    // Swap the leading [locale] segment, keep the rest of the path intact.
    const segments = pathname.split("/")
    segments[1] = option.code
    const next = segments.join("/") || "/"
    startTransition(() => {
      router.push(next)
    })
  }

  return (
    <Listbox as="div" value={current} onChange={handleChange} disabled={isPending}>
      <ListboxButton className="py-1 w-full text-left">
        <div className="txt-compact-small flex items-center gap-x-2">
          <span>{t("General.language")}</span>
          <span className="txt-compact-small">
            {isPending ? "…" : current.label}
          </span>
        </div>
      </ListboxButton>
      <ListboxOptions className="z-[900] bg-white drop-shadow-md text-small-regular text-black rounded-rounded mt-2 w-full min-w-[160px]">
        {LOCALES.map((o) => (
          <ListboxOption
            key={o.code}
            value={o}
            className="py-2 px-3 cursor-pointer hover:bg-gray-200 data-[focus]:bg-gray-200"
          >
            {o.label}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}

export default LocaleSwitcher
