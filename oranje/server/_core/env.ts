// Only use DATABASE_URL if it is a MySQL/MySQL2 connection string.
// This prevents the mysql2 driver from attempting to connect to a
// PostgreSQL URL (e.g. the one injected by Replit's built-in DB).
const rawDatabaseUrl = process.env.DATABASE_URL ?? "";
const isMysqlUrl =
  rawDatabaseUrl.startsWith("mysql://") ||
  rawDatabaseUrl.startsWith("mysql2://") ||
  rawDatabaseUrl.startsWith("mysql+://");

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: isMysqlUrl ? rawDatabaseUrl : "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
