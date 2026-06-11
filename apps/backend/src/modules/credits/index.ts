import { Module } from "@medusajs/framework/utils"
import CreditsModuleService from "./service"

export const CREDITS_MODULE = "credits"

export default Module(CREDITS_MODULE, {
  service: CreditsModuleService,
})
