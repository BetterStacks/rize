import { topics as topicsTable } from "@/db/schema";
import db from "@/lib/db";

type TopicSeed = { name: string; emoji: string; description: string };

const TOPICS: TopicSeed[] = [
    // ── Technology & Engineering ─────────────────────────────────────────────
    { name: "Software Engineering", emoji: "💻", description: "Building software products, architecture, and engineering culture" },
    { name: "Web Development", emoji: "🌐", description: "Frontend, backend, and full-stack web development" },
    { name: "Mobile Development", emoji: "📱", description: "iOS, Android, and cross-platform app development" },
    { name: "DevOps & Infrastructure", emoji: "⚙️", description: "CI/CD, cloud, containers, and platform engineering" },
    { name: "Open Source", emoji: "🔓", description: "Open-source projects, contributions, and culture" },
    { name: "Artificial Intelligence", emoji: "🤖", description: "AI research, tools, and real-world applications" },
    { name: "Machine Learning", emoji: "🧠", description: "ML models, datasets, and experimentation" },
    { name: "Cybersecurity", emoji: "🔐", description: "Security research, vulnerabilities, and best practices" },
    { name: "Blockchain & Web3", emoji: "⛓️", description: "Decentralized tech, smart contracts, and crypto" },
    { name: "Data Science", emoji: "📊", description: "Data analysis, visualisation, and insights" },
    { name: "Developer Tools", emoji: "🛠️", description: "Tools that make developers more productive" },
    { name: "APIs & Integrations", emoji: "🔌", description: "API design, SDKs, and integration patterns" },
    { name: "Game Development", emoji: "🎮", description: "Game engines, mechanics, and indie dev journeys" },
    { name: "Hardware & IoT", emoji: "🔧", description: "Embedded systems, electronics, and connected devices" },

    // ── Design & Creativity ──────────────────────────────────────────────────
    { name: "Product Design", emoji: "🎨", description: "UX/UI design, design systems, and user research" },
    { name: "Motion & Animation", emoji: "✨", description: "After Effects, Lottie, CSS animations, and motion design" },
    { name: "Brand Identity", emoji: "🏷️", description: "Logos, visual identity, and brand strategy" },
    { name: "Illustration", emoji: "🖌️", description: "Digital and traditional illustration and visual art" },
    { name: "Typography", emoji: "🔤", description: "Fonts, type design, and typographic craft" },
    { name: "Photography", emoji: "📸", description: "Photography techniques, gear, and visual storytelling" },
    { name: "3D & Generative Art", emoji: "🧊", description: "3D modelling, renders, and generative/code art" },
    { name: "Design Resources", emoji: "📦", description: "Templates, UI kits, icons, and free design assets" },

    // ── Product & Startups ───────────────────────────────────────────────────
    { name: "Product Management", emoji: "🗺️", description: "Roadmaps, prioritisation, metrics, and PM craft" },
    { name: "Startups", emoji: "🚀", description: "Founding stories, growth, fundraising, and lessons learned" },
    { name: "Indie Hacking", emoji: "🧑‍💻", description: "Building and shipping solo products and micro-SaaS" },
    { name: "SaaS", emoji: "☁️", description: "Software-as-a-service business models and product growth" },
    { name: "No-Code & Low-Code", emoji: "🧩", description: "Building with Webflow, Bubble, Notion, and no-code tools" },
    { name: "Growth & Marketing", emoji: "📈", description: "User acquisition, distribution, and growth strategies" },
    { name: "Venture Capital", emoji: "💸", description: "VC landscape, fundraising, and investor perspectives" },

    // ── Career & Professional Growth ─────────────────────────────────────────
    { name: "Career Growth", emoji: "🎯", description: "Navigating your career, promotions, and professional development" },
    { name: "Job Hunting", emoji: "🔍", description: "Interviewing, resumes, and landing your next role" },
    { name: "Freelancing", emoji: "🧳", description: "Client work, rates, contracts, and freelance life" },
    { name: "Remote Work", emoji: "🏡", description: "Working remotely — tools, routines, and culture" },
    { name: "Leadership", emoji: "🧭", description: "Engineering management, team building, and leadership" },
    { name: "Mentorship", emoji: "🤝", description: "Giving and receiving mentorship and guidance" },
    { name: "Learning & Education", emoji: "📚", description: "Courses, books, self-learning, and skill building" },

    // ── Writing & Content ────────────────────────────────────────────────────
    { name: "Technical Writing", emoji: "✍️", description: "Docs, blog posts, changelogs, and engineering writing" },
    { name: "Newsletters", emoji: "📨", description: "Email newsletters, subscriber growth, and content strategy" },
    { name: "Podcasting", emoji: "🎙️", description: "Starting and growing a podcast" },
    { name: "Content Creation", emoji: "📹", description: "YouTube, short-form video, and building an audience" },

    // ── Personal & Lifestyle ─────────────────────────────────────────────────
    { name: "Productivity", emoji: "⚡", description: "Systems, habits, and tools to get things done" },
    { name: "Mental Health", emoji: "🌱", description: "Wellbeing, burnout, and mental health in tech" },
    { name: "Finance & Investing", emoji: "💰", description: "Personal finance, investing, and wealth building" },
    { name: "Side Projects", emoji: "🏗️", description: "Building things on the side — experiments and launches" },
    { name: "Life Updates", emoji: "📍", description: "Personal milestones, moves, and life chapters" },
    { name: "Books & Reading", emoji: "📖", description: "Book recommendations, reviews, and reading lists" },

    // ── Community & Culture ──────────────────────────────────────────────────
    { name: "Diversity & Inclusion", emoji: "🌍", description: "DEI in tech, underrepresented voices, and allyship" },
    { name: "Ethics in Tech", emoji: "⚖️", description: "Responsible AI, privacy, and tech's societal impact" },
    { name: "Rize Community", emoji: "🏔️", description: "Meta conversations about Rize, features, and the community" },
    { name: "Showreel", emoji: "🎬", description: "Showcasing your work, portfolio highlights, and demos" },
    { name: "Hot Takes", emoji: "🔥", description: "Opinions, debates, and spicy tech takes" },
    { name: "Wins & Milestones", emoji: "🏆", description: "Celebrating launches, achievements, and personal wins" },
    { name: "Ask Me Anything", emoji: "🙋", description: "Questions, AMAs, and open conversations" },
];

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

async function seed() {
    console.log("🌱 Seeding topics...");
    const values = TOPICS.map(({ name, emoji, description }) => ({
        name,
        slug: slugify(name),
        emoji,
        description,
    }));
    await db.insert(topicsTable).values(values).onConflictDoNothing();
    console.log(`✅ ${TOPICS.length} topics seeded`);
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
