import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { LineAuthService } from "./services/line"

export default ModuleProvider(Modules.AUTH, {
  services: [LineAuthService],
})
