import { model } from "@medusajs/framework/utils"

/** A customer's submission of a form. `data` is the filled field values. */
const FormSubmission = model.define("form_submission", {
  id: model.id().primaryKey(),
  form_handle: model.text(),
  data: model.json(),
  email: model.text().nullable(),
  status: model.enum(["new", "read", "archived"]).default("new"),
})

export default FormSubmission
