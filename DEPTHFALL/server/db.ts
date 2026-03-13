import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } catch (error) {
    console.warn(
      "Failed to initialize database. Running in limited mode without leaderboard persistence.",
      error
    );
  }
} else if (process.env.NODE_ENV === "production") {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
} else {
  console.warn(
    "DATABASE_URL not set. Running in development mode without leaderboard persistence."
  );
}

export { db, pool };
