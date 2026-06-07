# 資料庫選型（全球化電商）

> 結論先講：**Medusa 強制用 PostgreSQL**，所以選的是「哪家 Postgres 託管」。
> 後端只靠 `DATABASE_URL` 連線 → **可隨時換家，不綁死**。dev 先用 Supabase，正式上線再定案都來得及。

## 硬性限制
- ✅ 必須 **PostgreSQL**（Medusa/MikroORM）。
- ❌ 不可用 MySQL（PlanetScale）、MongoDB。
- ⚠️ CockroachDB／其他「Postgres 相容」分散式 DB：非 100% 相容，Medusa 不保證可跑 → 不建議冒險。

## 全球化真正的關鍵（比「選哪家」更重要）
- 寫入一律在**單一主庫**；全球低延遲靠：**邊緣快取（Vercel 前台 SSR/ISR）+ 唯讀副本（read replica）+ CDN**。
- 真正的「多區域同時寫入」（Aurora Global / Cockroach）通常**初期用不到**，成本與複雜度高，等規模到了再上。
- 所以策略：**主庫放主力市場區域 + 視成長加唯讀副本 + 前台大量邊緣快取**。

## 候選 Postgres 託管比較

| 方案 | 優點 | 缺點 | 適合 |
|---|---|---|---|
| **Supabase** | DX 好、含 Auth/Storage/Realtime、便宜、已在用 | 主庫單區域；副本要付費；附帶功能我們未必全用 | dev、中小規模、想要 Realtime |
| **Neon** | Serverless、自動擴縮、分支(branching)、便宜起步、有唯讀副本 | 純 DB（無 Auth/Storage）；超大規模較少見 | 想要彈性擴縮 + 省成本的生產環境 ⭐ |
| **AWS RDS / Aurora Postgres** | 企業級穩、Aurora **Global Database 真多區域**、HA、生態完整 | 較貴、要懂 AWS 維運 | 企業級、要全球多區域 ⭐（你企業預算可選） |
| **Google Cloud SQL / AlloyDB** | 高效能、AlloyDB 讀取快、GCP 生態 | 綁 GCP、維運門檻 | 已用 GCP 者 |
| **Azure DB for Postgres** | 企業、Azure 生態 | 綁 Azure | 已用 Azure 者 |
| **Railway / Render / DO** | 簡單便宜 | 規模/HA 較弱 | dev、小型 |
| **Crunchy Bridge** | 純 Postgres 專家級、合規強 | 知名度較低 | 重合規/重 Postgres 調校 |

## 建議（依你的條件：企業預算、全球、Medusa headless）
1. **dev / 現階段**：**續用 Supabase**（已接好、免費、可含 Auth/Storage/Realtime 做聊天即時推播）。
2. **正式上線**，二選一依偏好：
   - **省成本、彈性優先 → Neon**（serverless、分支、唯讀副本，跟 Vercel 很搭）。
   - **企業級、要全球多區域與最高穩定度 → AWS Aurora Postgres（含 Global Database）**。
3. 不論選哪家：前台 Next.js 開 **ISR/邊緣快取**、DB 加 **唯讀副本** 對應全球讀取。
4. **Auth/Storage/Realtime** 若離開 Supabase：Auth 用 Medusa 內建（已設定）、Storage 改 S3/R2、Realtime 改 Ably/Pusher 或自建——都可替換。

## 何時決定？
- **不急**。可等到「準備部署」時定案，屆時：建新 DB → `pg_dump` 現有 → 還原 → 改 `DATABASE_URL` → 重跑 migration 驗證。半天內可完成，零程式改動。

## 待你決定
- 正式環境偏好：**Neon（省、彈性）** vs **AWS Aurora（企業、全球多區）** vs **續留 Supabase 升級**？
- 是否仍要用 Supabase 的 Auth/Storage/Realtime，還是只當純 DB？
