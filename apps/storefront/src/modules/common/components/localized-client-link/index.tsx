"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current
 * locale and country code in the url (/{locale}/{countryCode}/...), without
 * having to explicitly pass them as props.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: unknown
}) => {
  const { countryCode, locale } = useParams()

  const prefix = [locale, countryCode].filter(Boolean).join("/")

  return (
    <Link href={`/${prefix}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
