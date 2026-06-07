import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getForm } from "@lib/data/forms"
import DynamicForm from "@modules/forms/components/dynamic-form"

export const metadata: Metadata = {
  title: "聯絡我們 | Medusa Store",
  description: "有任何問題，歡迎留言給我們。",
}

export default async function ContactPage() {
  const form = await getForm("contact")

  if (!form) {
    notFound()
  }

  return (
    <div className="content-container py-12">
      <h1 className="text-2xl-semi mb-2">{form.title}</h1>
      {form.description && (
        <p className="text-ui-fg-subtle mb-8">{form.description}</p>
      )}
      <DynamicForm form={form} />
    </div>
  )
}
