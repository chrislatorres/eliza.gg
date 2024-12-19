import { Client, createClient } from "@libsql/client";
import { log, logError } from "./logging";

let tursoClient: Client | null = null;

export function createTurso(): Client {
  if (tursoClient) {
    return tursoClient;
  }

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("Missing Turso credentials in environment variables");
  }

  try {
    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    log("Successfully created Turso client");
    return tursoClient;
  } catch (error) {
    logError("Failed to create Turso client", error);
    throw error;
  }
}

// Add a helper function to execute with retries
export async function executeTursoQuery<T>(
  operation: () => Promise<T>,
  retryCount = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError;
  let delay = initialDelay;

  for (let i = 0; i < retryCount; i++) {
    try {
      // Create a new client if needed
      if (!tursoClient) {
        createTurso();
      }

      return await operation();
    } catch (error: any) {
      lastError = error;
      logError(
        `Database operation failed (attempt ${i + 1}/${retryCount})`,
        error
      );

      // Check if it's a connection error
      if (
        error.message.includes("ConnectionClosed") ||
        error.message.includes("socket connection was closed")
      ) {
        log("Recreating Turso client due to connection error");
        tursoClient = null; // Force client recreation
        createTurso();
      }

      if (i < retryCount - 1) {
        log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}
