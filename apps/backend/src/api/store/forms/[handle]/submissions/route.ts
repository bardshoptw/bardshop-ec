import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FORMS_MODULE } from "../../../../../modules/forms"
import FormsModuleService from "../../../../../modules/forms/service"

// POST /store/forms/:handle/submissions — submit a filled form.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = req.params
  const body = (req.body ?? {}) as { data?: Record<string, unknown>; email?: string }
  const service: FormsModuleService = req.scope.resolve(FORMS_MODULE)

  const [form] = await service.listFormDefinitions({ handle, enabled: true })
  if (!form) {
    return res.status(404).json({ message: `Form '${handle}' not found` })
  }

  const data = body.data ?? {}

  // Validate required fields declared in the definition.
  const missing = (form.fields as any[])
    .filter((f) => f?.required && !`${data[f.name] ?? ""}`.trim())
    .map((f) => f.name)
  if (missing.length) {
    return res
      .status(400)
      .json({ message: "Missing required fields", fields: missing })
  }

  const submission = await service.createFormSubmissions({
    form_handle: handle,
    data,
    email: body.email ?? (data["email"] as string) ?? null,
    status: "new",
  })

  res.status(201).json({ submission })
}
