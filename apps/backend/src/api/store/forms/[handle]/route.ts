import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FORMS_MODULE } from "../../../../modules/forms"
import FormsModuleService from "../../../../modules/forms/service"

// GET /store/forms/:handle — fetch an enabled form definition for rendering.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = req.params
  const service: FormsModuleService = req.scope.resolve(FORMS_MODULE)

  const [form] = await service.listFormDefinitions({
    handle,
    enabled: true,
  })

  if (!form) {
    return res.status(404).json({ message: `Form '${handle}' not found` })
  }

  res.json({ form })
}
