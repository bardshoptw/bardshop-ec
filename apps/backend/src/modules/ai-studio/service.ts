import { MedusaService } from "@medusajs/framework/utils"
import AiJob from "./models/ai-job"
import Asset from "./models/asset"

class AiStudioModuleService extends MedusaService({
  AiJob,
  Asset,
}) {}

export default AiStudioModuleService
