import * as schema from "./schema";

export function getDb() {
  throw new Error(
    "Database not yet configured for Vercel. Please set up Vercel Postgres or Turso if needed."
  );
}
