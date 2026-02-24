import { categories as categoriesTable } from "@/db/schema";
import db from "@/lib/db";
import { randomUUID } from "crypto";

const categories = [
    "Blogging",
    "Bookmarking",
    "Branding",
    "Blockchain",
    "Chrome Extension",
    "Crypto",
    "DevTool",
    "Design Resources",
    "Ecommerce",
    "Email Marketing",
    "Email",
    "Newsletter",
    "News",
    "Notion Template",
    "Productivity",
    "Project Management",
    "Podcast",
    "Portfolio",
    "Programming Language",
    "Resume Builder",
    "Framer Template",
    "Gaming",
    "Hiring",
    "Icon Sets",
    "Internet of Things (IoT)",
    "Link in Bio Tools",
    "Marketing",
    "Mobile App",
    "Finance",
    "Figma Plugin",
    "Figma Template",
    "AI Advertising and Analytics Tool"
];

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

async function seedCategories() {
    console.log("🌱 Seeding categories...");

    const values = categories.map((name) => ({
        name,
        slug: slugify(name),
    }));

    await db
        .insert(categoriesTable)
        .values(values)
        .onConflictDoNothing(); // avoids duplicates

    console.log("✅ Categories seeded");
    process.exit(0);
}

seedCategories().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});