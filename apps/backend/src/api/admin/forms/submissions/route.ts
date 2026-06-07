import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FORMS_MODULE } from "../../../../modules/forms"
import FormsModuleService from "../../../../modules/forms/service"

// GET /admin/forms/submissions — list form submissions (inbox).
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: FormsModuleService = req.scope.resolve(FORMS_MODULE)
  const submissions = await service.listFormSubmissions(
    {},
    { order: { created_at: "DESC" }, take: 100 }
  )
  res.json({ submissions })
}
