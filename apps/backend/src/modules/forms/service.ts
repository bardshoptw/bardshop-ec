import { MedusaService } from "@medusajs/framework/utils"
import FormDefinition from "./models/form-definition"
import FormSubmission from "./models/form-submission"

class FormsModuleService extends MedusaService({
  FormDefinition,
  FormSubmission,
}) {}

export default FormsModuleService
