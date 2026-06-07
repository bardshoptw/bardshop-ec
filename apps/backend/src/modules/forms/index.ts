import { Module } from "@medusajs/framework/utils"
import FormsModuleService from "./service"

export const FORMS_MODULE = "forms"

export default Module(FORMS_MODULE, {
  service: FormsModuleService,
})
