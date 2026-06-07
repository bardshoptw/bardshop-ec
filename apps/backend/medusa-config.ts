import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Default the admin dashboard language to Traditional Chinese (zhTW) on first
// visit, while keeping it fully switchable. Injected into the admin index.html
// so it runs before the app/i18n bundle loads (no English flash). Once a user
// picks a language in the UI, that choice is written to the `lng` cookie and
// always wins over this default.
const DEFAULT_ADMIN_LOCALE = "zhTW"
const defaultLocaleScript =
  "try{if(!/(?:^|; )lng=/.test(document.cookie)&&!localStorage.getItem('lng')){" +
  "document.cookie='lng=" + DEFAULT_ADMIN_LOCALE + ";path=/;max-age=31536000';" +
  "localStorage.setItem('lng','" + DEFAULT_ADMIN_LOCALE + "');}}catch(e){}"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    vite: () => {
      return {
        plugins: [
          {
            name: "default-admin-locale",
            transformIndexHtml(html: string) {
              return {
                html,
                tags: [
                  {
                    tag: "script",
                    injectTo: "head-prepend" as const,
                    children: defaultLocaleScript,
                  },
                ],
              }
            },
          },
        ],
      }
    },
  },
})
