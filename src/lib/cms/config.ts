export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.startsWith("postgres"));
}

export function cmsConfigured() {
  return databaseConfigured() && Boolean(process.env.BETTER_AUTH_URL) &&
    (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32 && adminEmails().length > 0;
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
}
