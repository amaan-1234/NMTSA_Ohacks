import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to use the database (set it before calling getDb()).");
  }
  const client = new Pool({ connectionString: url });
  return drizzle({ client, schema });
}

// Export a db instance for direct use
export const db = getDb();
