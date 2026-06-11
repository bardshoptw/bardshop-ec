import { Module } from "@medusajs/framework/utils"
import AiStudioModuleService from "./service"

export const AI_STUDIO_MODULE = "ai_studio"

export default Module(AI_STUDIO_MODULE, {
  service: AiStudioModuleService,
})
