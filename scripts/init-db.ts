import "dotenv/config";

import { db } from "@/lib/db";
import { createTables } from "@/database/schema";

async function main() {
  try {
    await createTables();

    console.log("Database initialized!");
  } catch (error) {
    console.error("Database error:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();