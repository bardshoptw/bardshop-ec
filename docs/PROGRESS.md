# 專案進度總表

> 全球 AI 電商平台（Medusa v2 + Next.js + Supabase）。本檔記錄已完成事項與待辦。

## ✅ 已完成

### 基礎建設
- Node 20（nvm 安裝，需 `source ~/.nvm/nvm.sh && nvm use 20`）
- Medusa v2 後端 + Next.js 15 前台（turbo monorepo，`store/apps/backend`、`store/apps/storefront`）
- 接上 Supabase Postgres（連線字串需 `?sslmode=no-verify`）
- 資料表 migration + 種子（4 個示範商品、Europe 區域）
- Admin 帳號：`admin@store.local` / `Admin12345!`（dev 用，上線前換）
- Git 版本控制（密碼 .env 已忽略，每里程碑一個 commit）

### 後台中文化
- 預設繁體中文、可中/英/日/韓切換（寫在 `medusa-config.ts`，重裝不失效）

### GEO / AI-SEO
- 商品頁 Product/Offer JSON-LD（名稱/圖/價格/庫存，價格隨區域幣別）
- `/llms.txt`（給 AI 的網站導覽）
- robots 放行 12 個 AI 爬蟲（GPTBot、PerplexityBot、Google-Extended、ClaudeBot…）
- sitemap（next-sitemap，build 時產生）

### 多幣別
- 美國/USD 區域（與 Europe/EUR 並存）；切國家自動換幣別（驗證 $15 USD vs €10 EUR）

### 多語系前台（i18n）
- next-intl，**網址含語言** `/{locale}/{countryCode}/...`（SEO 最佳）
- 4 語言：en / zh-TW / ja / ko
- 已翻譯：Hero、導覽列、商品按鈕、側邊選單、聯絡表單、聊天
- UI 語言切換器（側邊選單）
- 商品頁 hreflang alternates（SEO）

### 自訂表單系統（#4 核心）
- `forms` 模組（表單定義 + 提交）+ store/admin API
- 前台 `/{locale}/{countryCode}/contact` 動態表單（4 語言）
- 後台「表單收件匣」（看留言 + 詳情）

### 簡易即時通訊（#5）
- `chat` 模組（對話 + 訊息）+ store/admin API
- 前台浮動「線上客服」聊天視窗（輪詢、4 語言）
- 後台「即時客服」收件匣（對話列表 + 回覆）

### 第三方登入（#3）
- auth 模組：emailpass + **Google（✅ 已填憑證、後端驗證可回傳 Google 授權網址）** + LINE（插槽，等憑證）
- 前台「使用 Google 登入」按鈕 + OAuth callback（`/oauth/callback/google`）
- ⚠️ 實際瀏覽器登入還需：Google Console 註冊 redirect URI + 加測試使用者（見對話）

### 資料匯入 / 匯出 API（常態可用）
- `GET /admin/export/:resource`（products/customers/orders，CSV 或 JSON）
- `POST /admin/import/customers`（email 去重 upsert，含地址+metadata）；商品用 Medusa 內建匯入
- ✅ 驗證：匯出商品/顧客、匯入顧客（建立+更新冪等）

### 點數錢包 + AI 工作室（#2/#4 後端）
- `credits` 模組：錢包 + 交易紀錄 + 原子扣/加點（餘額不足擋下、失敗自動退點）
- `ai-studio` 模組：AI 任務 + 素材庫 + provider 抽象
- **自動去背 = Photoroom**：✅ 端到端驗證（去背→上傳檔案模組→回傳 `/static` 透明 PNG 網址）
- **自動生圖 = FLUX.1 dev (fal)**：程式接好、金鑰有效；⚠️ **等 fal 帳戶儲值**（fal.ai/dashboard/billing）
- store API：`/store/ai/jobs`（扣點→生成→存素材，需會員登入）

### 管理員帳號
- `snow@bardshoptw.com` / `42828690`（你的）｜`admin@store.local` / `Admin12345!`（初始）

### 文件
- `docs/shopline-feature-parity.md`：Shopline 15 模組 + Shopify 對標 + 設計哲學 + backlog
- `docs/PROGRESS.md`：本檔

## 🟡 進行中 / 等你提供
- **自動生圖 FLUX** → 等你到 fal.ai/dashboard/billing **儲值**（去背已可用）
- **#3 Google 登入** → 後端✅；等你在 Google Console 註冊 redirect URI + 加測試使用者才能實際登入；**LINE** 等憑證
- **#1 電子發票** → 等綠界/藍新測試金鑰 + 統編
- **#16 Shopline 資料遷移** → 等你提供 Shopline CSV 樣本（商品/顧客/訂單）
- **#19 前台 AI 工作室頁** → 後端就緒，前台操作頁待做
- **#4 表單視覺化編輯器**（目前表單用 API/種子建立）

## ⬜ Backlog（已記，未開始）
- #6 ERP 即時庫存 API（你第 5 點）
- 設定後台（新功能各自的設定頁）
- 部落格 / 知識文章 CMS（利 GEO）
- 行銷嵌入（GA4 / Meta Pixel / LINE / 自訂追蹤碼）
- 上線部署（Vercel + 雲端後端主機）
- 串 Stripe + 台灣金流（綠界/藍新）+ 超商物流
- 加台灣 TWD 等更多市場
- 補完長尾翻譯（購物車內頁/結帳/會員細項）
- P3：分潤/聯盟、忠誠度(點數/分級)、社交電商(直播/留言成單)、多通路上架、B2B2C 廠商上架

## 本機如何看
- 前台：`http://localhost:8000`（自動帶語言+國家；右下「線上客服」；`/contact` 表單）
- 後台：`http://localhost:9000/app`（admin 帳密如上；左側「表單收件匣」「即時客服」）
- 啟動需先 `source ~/.nvm/nvm.sh && nvm use 20`；後端 `store/apps/backend` 跑 `npm run dev`，前台 `store/apps/storefront` 跑 `npm run dev`
