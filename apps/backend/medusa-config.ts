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
  modules: [
    {
      // Custom forms (admin-defined contact/lead forms + submissions inbox)
      resolve: "./src/modules/forms",
    },
    {
      // Simple support chat (conversations + messages)
      resolve: "./src/modules/chat",
    },
    {
      // Auth module: keep emailpass (admin + email/password customers) and
      // enable third-party providers only when their credentials are present,
      // so the backend still boots before credentials are supplied.
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                {
                  resolve: "@medusajs/medusa/auth-google",
                  id: "google",
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackUrl:
                      process.env.GOOGLE_CALLBACK_URL ||
                      "http://localhost:9000/auth/customer/google/callback",
                  },
                },
              ]
            : []),
          ...(process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET
            ? [
                {
                  resolve: "./src/modules/auth-line",
                  id: "line",
                  options: {
                    clientId: process.env.LINE_CLIENT_ID,
                    clientSecret: process.env.LINE_CLIENT_SECRET,
                    callbackUrl:
                      process.env.LINE_CALLBACK_URL ||
                      "http://localhost:9000/auth/customer/line/callback",
                  },
                },
              ]
            : []),
        ],
      },
    },
  ],
})
