import { betterAuth } from "better-auth";
import { database } from "./db";
import { adminEmails, authenticationConfigured, cmsConfigured } from "./config";

export function makeAuth(bootstrap = false) {
  if (!authenticationConfigured()) throw new Error("CMS authentication is not configured.");
  return betterAuth({
    appName: "Mellon Admin",
    database: database(),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: { enabled: true, disableSignUp: !bootstrap, minPasswordLength: 12 },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 60, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 60,
      customRules: { "/sign-in/email": { window: 60, max: 5 }, "/change-password": { window: 60, max: 5 } } },
    advanced: { ipAddress: { ipAddressHeaders: ["x-real-ip"] } },
  });
}

let instance: ReturnType<typeof makeAuth> | undefined;
export function auth() { return instance ??= makeAuth(); }

export async function adminSession(headers: Headers) {
  if (!cmsConfigured()) return null;
  const session = await auth().api.getSession({ headers });
  return session && adminEmails().includes(session.user.email.toLowerCase()) ? session : null;
}
