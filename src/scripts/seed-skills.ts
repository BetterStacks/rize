import { skills as skillsTable } from "@/db/schema";
import db from "@/lib/db";

const skills = [
    // Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "PHP", "Ruby",

    // Frontend
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "TailwindCSS", "HTML", "CSS", "Sass", "Framer Motion", "Redux", "Recoil", "Zustand", "TanStack Query",

    // Backend
    "Node.js", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot", "Laravel", "Bun", "Deno",

    // Databases & ORM
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "Prisma", "Drizzle ORM", "Mongoose", "Supabase", "Firebase",

    // Infrastructure & Cloud
    "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Heroku", "CI/CD", "Terraform",

    // Mobile
    "React Native", "Flutter", "iOS Development", "Android Development",

    // Tools & Others
    "Git", "GitHub", "Vite", "Webpack", "Postman", "GraphQL", "tRPC", "WebSockets", "Web3", "Solidity",

    // Design
    "Figma", "Adobe XD", "Photoshop", "UI/UX Design", "Graphic Design", "3D Modeling",

    // Non-Technical (Soft Skills & Business)
    "Leadership", "Project Management", "Communication", "Teamwork", "Public Speaking", "Problem Solving", "Time Management", "Critical Thinking", "Creativity", "Adaptability", "Conflict Resolution", "Agile", "Scrum", "Marketing", "Sales", "Business Development", "Customer Success", "Copywriting", "SEO", "Product Management", "Strategic Planning",
];

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

async function seedSkills() {
    console.log("🌱 Seeding skills...");

    const values = skills.map((name) => ({
        name,
        slug: slugify(name),
    }));

    await db
        .insert(skillsTable)
        .values(values)
        .onConflictDoNothing();

    console.log(`✅ ${values.length} Skills seeded`);
    process.exit(0);
}

seedSkills().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
