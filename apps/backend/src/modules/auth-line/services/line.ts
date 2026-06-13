import crypto from "crypto"
import { AbstractAuthModuleProvider, MedusaError } from "@medusajs/framework/utils"

type LineOptions = {
  clientId: string
  clientSecret: string
  callbackUrl: string
}

// Decode a JWT payload without verifying the signature. Safe here because the
// id_token is fetched directly from LINE's token endpoint over TLS (same
// approach Medusa's official Google provider uses).
function decodeJwtPayload(token: string): Record<string, any> {
  const part = token.split(".")[1]
  const json = Buffer.from(
    part.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8")
  return JSON.parse(json)
}

/**
 * Custom Medusa v2 auth provider for LINE Login (OAuth2 + OIDC).
 * Mirrors the official @medusajs/auth-google provider structure.
 */
export class LineAuthService extends AbstractAuthModuleProvider {
  static identifier = "line"
  static DISPLAY_NAME = "LINE Login"

  protected config_: LineOptions
  protected logger_: any

  static validateOptions(options: LineOptions) {
    if (!options.clientId) throw new Error("LINE clientId is required")
    if (!options.clientSecret) throw new Error("LINE clientSecret is required")
    if (!options.callbackUrl) throw new Error("LINE callbackUrl is required")
  }

  constructor({ logger }: any, options: LineOptions) {
    // @ts-ignore
    super(...arguments)
    this.config_ = options
    this.logger_ = logger
  }

  async register(_: any) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "LINE does not support registration. Use method `authenticate` instead."
    )
  }

  async authenticate(req: any, authIdentityService: any) {
    const query = req.query ?? {}
    const body = req.body ?? {}
    if (query.error) {
      return {
        success: false,
        error: `${query.error_description ?? query.error}`,
      }
    }
    const stateKey = crypto.randomBytes(32).toString("hex")
    const state = {
      callback_url: body?.callback_url ?? this.config_.callbackUrl,
    }
    await authIdentityService.setState(stateKey, state)
    return this.getRedirect(this.config_.clientId, state.callback_url, stateKey)
  }

  async validateCallback(req: any, authIdentityService: any) {
    const query = req.query ?? {}
    const body = req.body ?? {}
    if (query.error) {
      return {
        success: false,
        error: `${query.error_description ?? query.error}`,
      }
    }
    const code = query?.code ?? body?.code
    if (!code) return { success: false, error: "No code provided" }

    const state = await authIdentityService.getState(query?.state ?? body?.state)
    if (!state) {
      return { success: false, error: "No state provided, or session expired" }
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: state.callback_url,
      client_id: this.config_.clientId,
      client_secret: this.config_.clientSecret,
    })

    try {
      const response = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }).then((r) => {
        if (!r.ok) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Could not exchange token, ${r.status} ${r.statusText}`
          )
        }
        return r.json()
      })

      return await this.verify_(response.id_token, authIdentityService)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async verify_(idToken: string, authIdentityService: any) {
    if (!idToken) return { success: false, error: "No ID token returned" }

    const payload = decodeJwtPayload(idToken)
    const entity_id = payload.sub
    if (!entity_id) return { success: false, error: "No subject in ID token" }

    const userMetadata = {
      name: payload.name,
      email: payload.email, // present only if Email permission granted
      picture: payload.picture,
    }

    let authIdentity
    try {
      authIdentity = await authIdentityService.retrieve({ entity_id })
    } catch (error: any) {
      if (error.type === MedusaError.Types.NOT_FOUND) {
        authIdentity = await authIdentityService.create({
          entity_id,
          user_metadata: userMetadata,
        })
      } else {
        return { success: false, error: error.message }
      }
    }

    return { success: true, authIdentity }
  }

  getRedirect(clientId: string, callbackUrl: string, stateKey: string) {
    const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", callbackUrl)
    authUrl.searchParams.set("state", stateKey)
    authUrl.searchParams.set("scope", "profile openid email")
    return { success: true, location: authUrl.toString() }
  }
}
