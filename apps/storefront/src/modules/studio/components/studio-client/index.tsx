"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@modules/common/components/ui"
import { runAiJob, StudioAsset } from "@lib/data/studio"
import { submitForm } from "@lib/data/forms"

const COST: Record<string, number> = { generate: 5, bg_remove: 1 }

const TOPUP_PACKAGES = [
  { credits: 100, price: "NT$100" },
  { credits: 300, price: "NT$270" },
  { credits: 1000, price: "NT$800" },
]

export default function StudioClient({
  initialBalance,
  initialAssets,
  customerEmail,
}: {
  initialBalance: number
  initialAssets: StudioAsset[]
  customerEmail?: string
}) {
  const t = useTranslations()
  const [balance, setBalance] = useState(initialBalance)
  const [assets, setAssets] = useState<StudioAsset[]>(initialAssets)
  const [mode, setMode] = useState<"generate" | "bg_remove">("generate")
  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topupOpen, setTopupOpen] = useState(false)
  const [topupState, setTopupState] = useState<"idle" | "sending" | "sent">(
    "idle"
  )

  const cost = COST[mode]
  const canRun =
    !running &&
    balance >= cost &&
    (mode === "generate" ? prompt.trim().length > 0 : imageUrl.trim().length > 0)

  async function run() {
    setRunning(true)
    setError(null)
    const res = await runAiJob({
      type: mode,
      prompt: mode === "generate" ? prompt : undefined,
      image_url: mode !== "generate" ? imageUrl : undefined,
    })
    if (res.ok && res.asset) {
      setBalance((b) => b - (res.spent ?? 0))
      setAssets((a) => [res.asset!, ...a])
    } else {
      setError(res.insufficient ? t("Studio.insufficient") : t("Form.error"))
    }
    setRunning(false)
  }

  return (
    <div className="flex flex-col gap-y-8">
      {/* Balance + top-up */}
      <div className="flex items-center gap-x-4 flex-wrap">
        <span className="text-ui-fg-subtle">{t("Studio.balance")}：</span>
        <span className="text-2xl-semi">
          {balance} {t("Studio.credits")}
        </span>
        <Button
          variant="secondary"
          className="h-9"
          onClick={() => {
            setTopupOpen((o) => !o)
            setTopupState("idle")
          }}
        >
          {t("Studio.topup")}
        </Button>
      </div>

      {/* Top-up panel */}
      {topupOpen && (
        <div className="border border-ui-border-base rounded-lg p-6 max-w-2xl flex flex-col gap-y-4">
          {topupState === "sent" ? (
            <p className="text-ui-fg-base">{t("Studio.topupSent")}</p>
          ) : (
            <>
              <p className="text-ui-fg-subtle text-small-regular">
                {t("Studio.topupHint")}
              </p>
              <div className="flex gap-x-3 flex-wrap">
                {TOPUP_PACKAGES.map((p) => (
                  <button
                    key={p.credits}
                    disabled={topupState === "sending"}
                    onClick={async () => {
                      setTopupState("sending")
                      const res = await submitForm("topup", {
                        email: customerEmail ?? "",
                        package: p.price,
                        amount: String(p.credits),
                      })
                      setTopupState(res.ok ? "sent" : "idle")
                    }}
                    className="border border-ui-border-base rounded-lg px-6 py-4 hover:border-ui-fg-base text-left"
                  >
                    <div className="text-xl-semi">
                      {p.credits} {t("Studio.credits")}
                    </div>
                    <div className="text-ui-fg-subtle text-small-regular">
                      {p.price}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Operation panel */}
      <div className="border border-ui-border-base rounded-lg p-6 flex flex-col gap-y-4 max-w-2xl">
        <div className="flex gap-x-2">
          {(["generate", "bg_remove"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-small-regular border ${
                mode === m
                  ? "bg-ui-bg-interactive text-ui-fg-on-color border-transparent"
                  : "border-ui-border-base"
              }`}
            >
              {m === "generate" ? t("Studio.generate") : t("Studio.removeBg")}
            </button>
          ))}
        </div>

        {mode === "generate" ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("Studio.promptPlaceholder")}
            rows={3}
            className="border border-ui-border-base rounded-md px-3 py-2 w-full"
          />
        ) : (
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t("Studio.imageUrlPlaceholder")}
            className="border border-ui-border-base rounded-md px-3 py-2 w-full"
          />
        )}

        <div className="flex items-center justify-between">
          <span className="text-ui-fg-subtle text-small-regular">
            {t("Studio.cost", { cost })}
          </span>
          <Button
            variant="primary"
            onClick={run}
            isLoading={running}
            disabled={!canRun}
            className="h-10"
          >
            {running ? t("Studio.running") : t("Studio.runBtn")}
          </Button>
        </div>
        {error && (
          <p className="text-rose-500 text-small-regular">{error}</p>
        )}
      </div>

      {/* Asset library */}
      <div>
        <h2 className="text-xl-semi mb-4">{t("Studio.myAssets")}</h2>
        {assets.length === 0 ? (
          <p className="text-ui-fg-subtle">{t("Studio.noAssets")}</p>
        ) : (
          <div className="grid grid-cols-2 small:grid-cols-4 gap-4">
            {assets.map((a) => (
              <div
                key={a.id}
                className="border border-ui-border-base rounded-lg overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt={a.kind ?? "asset"}
                  className="w-full aspect-square object-cover"
                />
                <div className="px-2 py-1 text-xsmall-regular text-ui-fg-subtle">
                  {a.kind}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
