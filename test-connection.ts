import db from "./src/lib/db";
import { profile } from "./src/db/schema";
import { count } from "drizzle-orm";

async function testConnection() {
    console.log("Testing DB connection...");
    try {
        const result = await db.select({ value: count() }).from(profile);
        console.log("Connection successful! Profile count:", result[0].value);
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

testConnection();
