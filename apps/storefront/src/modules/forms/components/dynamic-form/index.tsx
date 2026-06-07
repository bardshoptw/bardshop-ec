"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@modules/common/components/ui"
import { FormDefinition, submitForm } from "@lib/data/forms"

const DynamicForm = ({ form }: { form: FormDefinition }) => {
  const t = useTranslations()
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const setField = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setError(null)
    const res = await submitForm(form.handle, values)
    if (res.ok) {
      setStatus("ok")
      setValues({})
    } else {
      setStatus("error")
      setError(res.error ?? null)
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-lg border border-ui-border-base p-6 text-center">
        <p className="text-ui-fg-base text-lg">{t("Form.success")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 max-w-xl">
      {form.fields.map((field) => {
        const common = {
          id: field.name,
          name: field.name,
          required: field.required,
          value: (values[field.name] as string) ?? "",
          onChange: (
            e: React.ChangeEvent<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >
          ) => setField(field.name, e.target.value),
          className:
            "border border-ui-border-base rounded-md px-3 py-2 w-full bg-ui-bg-field",
        }
        return (
          <div key={field.name} className="flex flex-col gap-y-1">
            <label htmlFor={field.name} className="text-small-regular">
              {field.label}
              {field.required && <span className="text-rose-500"> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea {...common} rows={5} />
            ) : field.type === "select" ? (
              <select {...common}>
                <option value="">—</option>
                {(field.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input {...common} type={field.type} />
            )}
          </div>
        )
      })}

      {status === "error" && (
        <p className="text-rose-500 text-small-regular">
          {t("Form.error")}
          {error ? `（${error}）` : ""}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={status === "sending"}
        disabled={status === "sending"}
        className="h-10"
      >
        {status === "sending" ? t("Form.sending") : t("Form.submit")}
      </Button>
    </form>
  )
}

export default DynamicForm
