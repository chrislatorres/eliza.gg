import { createClient } from "@libsql/client";

export function createTurso() {
  const client = createClient({
    url: "file:./db.db",
    syncUrl: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return client;
}
