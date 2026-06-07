import { MedusaContainer } from "@medusajs/framework"
import { FORMS_MODULE } from "../modules/forms"
import FormsModuleService from "../modules/forms/service"

// Seed a default "contact" form. Run: npx medusa exec ./src/scripts/seed-contact-form.ts
export default async function seedContactForm({
  container,
}: {
  container: MedusaContainer
}) {
  const service: FormsModuleService = container.resolve(FORMS_MODULE)

  const existing = await service.listFormDefinitions({ handle: "contact" })
  if (existing.length) {
    console.log("contact form already exists — skipping")
    return
  }

  await service.createFormDefinitions({
    handle: "contact",
    title: "聯絡我們",
    description: "有任何問題，歡迎留言給我們，我們會盡快回覆。",
    enabled: true,
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "電話", type: "tel", required: false },
      { name: "subject", label: "主旨", type: "text", required: false },
      { name: "message", label: "訊息內容", type: "textarea", required: true },
    ],
  })

  console.log("seeded contact form")
}
