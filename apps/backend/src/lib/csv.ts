// Minimal dependency-free CSV utilities (RFC4180-ish). Nested values are
// JSON-stringified on export and JSON-parsed-if-possible on import.

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let s: string
  if (typeof value === "object") {
    s = JSON.stringify(value)
  } else {
    s = String(value)
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ""
  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k))
      return set
    }, new Set<string>())
  )
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(","))
  }
  return lines.join("\n")
}

// Parse CSV text into array of row objects keyed by header.
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  if (!rows.length) return []
  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).filter((r) => r.some((c) => c !== "")).map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => (obj[h] = r[idx] ?? ""))
    return obj
  })
}
