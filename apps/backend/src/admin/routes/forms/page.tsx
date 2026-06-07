import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  Container,
  Heading,
  Table,
  Badge,
  Text,
  Drawer,
  Button,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type Submission = {
  id: string
  form_handle: string
  data: Record<string, unknown>
  email: string | null
  status: string
  created_at: string
}

const statusColor = (s: string) =>
  s === "new" ? "orange" : s === "read" ? "blue" : "grey"

const FormsInboxPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)

  useEffect(() => {
    fetch("/admin/forms/submissions", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions ?? []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">表單收件匣 / Form Inbox</Heading>
        <Badge size="small">{submissions.length}</Badge>
      </div>

      {loading ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">載入中…</Text>
        </div>
      ) : submissions.length === 0 ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">尚無留言</Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>表單</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>摘要</Table.HeaderCell>
              <Table.HeaderCell>狀態</Table.HeaderCell>
              <Table.HeaderCell>時間</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {submissions.map((s) => (
              <Table.Row key={s.id}>
                <Table.Cell>{s.form_handle}</Table.Cell>
                <Table.Cell>{s.email ?? "-"}</Table.Cell>
                <Table.Cell className="max-w-[280px] truncate">
                  {String(
                    s.data?.message ?? s.data?.subject ?? Object.values(s.data ?? {})[0] ?? ""
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge size="small" color={statusColor(s.status) as any}>
                    {s.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {new Date(s.created_at).toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setSelected(s)}
                  >
                    檢視
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>留言詳情</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-3">
            {selected &&
              Object.entries(selected.data ?? {}).map(([k, v]) => (
                <div key={k}>
                  <Text size="small" weight="plus">
                    {k}
                  </Text>
                  <Text className="text-ui-fg-subtle whitespace-pre-wrap">
                    {String(v)}
                  </Text>
                </div>
              ))}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "表單收件匣",
  icon: ChatBubbleLeftRight,
})

export default FormsInboxPage
