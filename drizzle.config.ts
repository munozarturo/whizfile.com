import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "utils/db/schema.ts",
	out: "utils/db/out",
});
