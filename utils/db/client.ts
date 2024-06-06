import * as schema from "~/utils/db/schema";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const PGSQL_URI = process.env.PGSQL_URI;
if (!PGSQL_URI) throw new Error("`PGSQL_URI` environment variable undefined.");

export const client = postgres(PGSQL_URI, { prepare: false });
export const dbClient = drizzle(client, { schema });
