# 安全強化清單（最高等級）

> 資料庫已有 25,393 筆真實顧客個資，安全為第一優先。本檔追蹤已完成與待辦。
> 圖例：✅ 已做｜🔴 你必須立即處理｜🟡 我可繼續做（程式層）｜🏗️ 部署時做（基礎設施）

## ✅ 已完成（本輪）
- **JWT_SECRET / COOKIE_SECRET**：原為預設 `supersecret`（可被偽造登入）→ 已換 **64 字元強隨機**（重啟後舊 token 失效）。
- **前台安全標頭**：HSTS、X-Content-Type-Options(nosniff)、X-Frame-Options(防點擊劫持)、Referrer-Policy、Permissions-Policy。
- **後台 API 驗證確認**：個資匯出 / 儲值等 `/admin/*` 端點無 token → 401（個資不裸奔）。
- **AUTH_MFA_ENCRYPTION_KEY** 已設定（支援後台 2FA）。
- 密鑰/金鑰皆在 `.env`，**git 已忽略**，不進版控。

## 🔴 你必須立即處理（憑證已暴露 / 過弱）
1. **重設 Supabase 資料庫密碼** — 目前密碼在本對話中出現過多次（已外洩風險）。
   → Supabase 後台 → Settings → Database → Reset database password → 給我新的，我更新 `DATABASE_URL`。
2. **強化後台管理員密碼** — `42828690`（8 碼數字，太弱）→ 改成含大小寫+符號的強密碼。
3. **開啟後台 2FA**（管理員登入雙重驗證）。

## 🟡 我可以接著做（程式層強化）
- **登入速率限制 / 防暴力破解**（auth 端點 rate limit + 鎖定）。
- **CORS 收斂**：目前允許 localhost；上線時鎖定正式網域（`STORE_CORS/ADMIN_CORS/AUTH_CORS`）。
- **Content-Security-Policy（CSP）**：限制可載入的 script/連線來源（需細調避免擋到正常資源）。
- **`sslmode=no-verify` → 驗證 CA**（正式環境用驗證憑證的 SSL 連線）。
- **npm audit 修補**（建置時有相依套件漏洞，逐一評估修補）。
- **稽核日誌**：記錄管理員敏感操作（匯出個資、改價、退款）。
- **聊天對話存取**：目前知道對話 ID 即可讀訊息 → 加每對話 token 強化。
- **密碼政策**：顧客註冊強制密碼強度。

## 🏗️ 部署時做（基礎設施）
- **Cloudflare WAF + DDoS 防護 + 速率限制**（擋攻擊、機器人）。
- **全站 HTTPS / HSTS preload**。
- **資料庫網路限制**：只允許後端主機 IP 連 Supabase（或私有網路）。
- **密鑰管理**：用雲端 Secrets Manager（Vault / Doppler / 平台環境變數），不靠 .env 檔。
- **備份與還原演練**：資料庫定期備份 + 還原測試。
- **PCI**：卡資交給 Stripe/金流商代管（不自存卡號）。
- **滲透測試 / 弱點掃描**：上線前做一次。

## 法遵（與安全相關）
- 個資保護法（台灣）：顧客 PII 最小化、加密、存取控管、外洩通報流程。
- 隱私權政策 + Cookie 同意。
