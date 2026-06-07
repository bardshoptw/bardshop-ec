import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FORMS_MODULE } from "../../../modules/forms"
import FormsModuleService from "../../../modules/forms/service"

// GET /admin/forms — list form definitions.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: FormsModuleService = req.scope.resolve(FORMS_MODULE)
  const forms = await service.listFormDefinitions({})
  res.json({ forms })
}

// POST /admin/forms — create a form definition.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: FormsModuleService = req.scope.resolve(FORMS_MODULE)
  const body = req.body as {
    handle: string
    title: string
    description?: string
    fields: unknown[]
    enabled?: boolean
  }
  const form = await service.createFormDefinitions({
    handle: body.handle,
    title: body.title,
    description: body.description ?? null,
    fields: body.fields ?? [],
    enabled: body.enabled ?? true,
  })
  res.status(201).json({ form })
}
