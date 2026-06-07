import { model } from "@medusajs/framework/utils"

/**
 * An admin-defined form. `fields` holds the customizable schema, e.g.:
 * [{ name, label, type: "text|email|textarea|select|checkbox|tel", required, options? }]
 */
const FormDefinition = model.define("form_definition", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  title: model.text(),
  description: model.text().nullable(),
  fields: model.json(),
  enabled: model.boolean().default(true),
})

export default FormDefinition
