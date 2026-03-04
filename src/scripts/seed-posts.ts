import db from "@/lib/db";
import { posts, postTopics, topics } from "@/db/schema";
import { inArray } from "drizzle-orm";

const PROFILES = [
    "ef20ce7e-5eb0-4e72-8539-2c62477f5d06",
    "7ffd0de5-9b4e-4485-9892-521e6b605379",
];

// Each post: content (HTML), profileId, topic slugs to assign
const SEED_POSTS: {
    profileId: string;
    content: string;
    topicSlugs: string[];
}[] = [
        {
            profileId: PROFILES[0],
            content: `<p>Postgres <strong>NOTIFY</strong> is good.</p><p>But it:</p><ul><li><p>Has payload size limits</p></li><li><p>Is not designed as a high-throughput message broker</p></li><li><p>Can struggle at very large scale</p></li></ul><p>Use it for low-volume internal signals, not as a replacement for Kafka.</p>`,
            topicSlugs: ["software-engineering", "devops-infrastructure"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>Things I wish I knew before building my first SaaS:</p><ol><li><p>Charge earlier than you think</p></li><li><p>Talk to users every week</p></li><li><p>Distribution > product at the start</p></li><li><p>Your first 10 customers will define the product</p></li></ol><p>Save yourself 6 months of building the wrong thing 🙏</p>`,
            topicSlugs: ["saas", "startups", "indie-hacking"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>The <strong>best engineers</strong> I've worked with share one trait:</p><p>They make complex things feel simple — not just in code, but in how they communicate, document, and hand things off.</p><p>Technical skill is table stakes. Communication is the multiplier.</p>`,
            topicSlugs: ["software-engineering", "career-growth", "leadership"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>Hot take: <em>TypeScript enums are a mistake.</em></p><p>Use <code>as const</code> objects instead:</p><ul><li><p>Better tree-shaking</p></li><li><p>Works with string literals</p></li><li><p>No runtime overhead</p></li><li><p>Easier to iterate over</p></li></ul><p>Enums create a parallel JavaScript concept that compiled code depends on at runtime. That's unnecessary complexity.</p>`,
            topicSlugs: ["web-development", "software-engineering", "hot-takes"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>I rewrote our API layer from REST to tRPC last month.</p><p>Observations:</p><ul><li><p>End-to-end type safety is genuinely life-changing</p></li><li><p>Onboarding new devs got 2x faster</p></li><li><p>We found 3 latent bugs during migration thanks to TS errors</p></li></ul><p>The migration took ~2 weeks. Worth every hour.</p>`,
            topicSlugs: ["web-development", "software-engineering"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>Design systems are infrastructure, not UI kits.</p><p>The difference:</p><ul><li><p><strong>UI kit</strong>: a bag of components you copy</p></li><li><p><strong>Design system</strong>: a shared language between design and eng that scales</p></li></ul><p>If your "system" only lives in Figma, it's not a system yet.</p>`,
            topicSlugs: ["product-design", "developer-tools"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>Shipped our new onboarding flow last week. Activation went from <strong>34% → 61%</strong> in 7 days.</p><p>What changed:</p><ul><li><p>Removed 4 steps from the signup form</p></li><li><p>Added inline progress indicator</p></li><li><p>Personalised the empty state based on role</p></li></ul><p>Less friction, not more features.</p>`,
            topicSlugs: ["product-management", "saas", "wins-milestones"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>CSS Grid vs Flexbox isn't a competition — they solve different problems:</p><ul><li><p><strong>Flex</strong>: one axis, content-driven layout</p></li><li><p><strong>Grid</strong>: two axes, container-driven layout</p></li></ul><p>Use both. The best layouts usually do.</p>`,
            topicSlugs: ["web-development", "product-design"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>Reading <em>The Pragmatic Programmer</em> for the second time hits differently after 3 years of production experience.</p><p>The advice hasn't changed. My ability to understand it has.</p><p>Some books need to be re-read at different career stages.</p>`,
            topicSlugs: ["books-reading", "career-growth", "learning-education"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>The most underrated skill in software engineering: <strong>knowing when NOT to build something.</strong></p><p>Every line of code is a liability. Every feature is a surface area for bugs.</p><p>The best PR I ever reviewed deleted 800 lines and solved the problem better.</p>`,
            topicSlugs: ["software-engineering", "hot-takes"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>Mental model that changed how I work:</p><p><strong>Slow is smooth. Smooth is fast.</strong></p><p>Rushing through PRs, skipping tests, and cutting corners creates drag that compounds weekly. Sustainable pace leads to higher throughput over time — not despite going slower, but because of it.</p>`,
            topicSlugs: ["productivity", "software-engineering", "mental-health"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>Just crossed <strong>1,000 GitHub stars</strong> on my open source project 🎉</p><p>What worked:</p><ul><li><p>Posted on HN Show on a Tuesday at 9am EST</p></li><li><p>Wrote a detailed README with real use-case examples</p></li><li><p>Responded to every issue within 24h for the first 3 months</p></li></ul><p>Community trust compounds just like code quality does.</p>`,
            topicSlugs: ["open-source", "wins-milestones", "growth-marketing"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>Unpopular opinion: <em>remote work is harder to do well than in-person work,</em> not easier.</p><p>It demands:</p><ul><li><p>Stronger async communication habits</p></li><li><p>More intentional relationship building</p></li><li><p>Better personal time management</p></li></ul><p>It's not a perk. It's a skill.</p>`,
            topicSlugs: ["remote-work", "hot-takes", "career-growth"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>Three architecture decisions that saved us from ourselves:</p><ol><li><p>Keeping the domain model in pure TypeScript (no ORM coupling)</p></li><li><p>Treating the database as a persistence detail, not the source of truth</p></li><li><p>Feature flags from day one — shipping dark is underrated</p></li></ol>`,
            topicSlugs: ["software-engineering", "devops-infrastructure"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>AI coding tools have changed my workflow more than any other tool in the last 5 years.</p><p>Not because they write code for me — but because they've made <strong>exploration much faster.</strong></p><p>I spike on unfamiliar problems in 20% of the time now. The bottleneck has shifted from "can I figure this out" to "what should I build."</p>`,
            topicSlugs: ["artificial-intelligence", "developer-tools", "productivity"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>Freelancing taught me more about product thinking than any full-time job.</p><p>When you own the client relationship end-to-end:</p><ul><li><p>Scope creep becomes real money lost</p></li><li><p>Communication becomes the product</p></li><li><p>You learn to say no fast</p></li></ul>`,
            topicSlugs: ["freelancing", "career-growth", "side-projects"],
        },
        {
            profileId: PROFILES[0],
            content: `<p>We spent 3 months building the wrong feature.</p><p>Not because we didn't have data — but because we asked users the wrong questions.</p><p><em>"What would you like to see?" ≠ "What are you trying to accomplish?"</em></p><p>The second question unlocks everything.</p>`,
            topicSlugs: ["product-management", "startups"],
        },
        {
            profileId: PROFILES[1],
            content: `<p>LLMs are genuinely terrible at:</p><ul><li><p>Knowing what they don't know</p></li><li><p>Consistent reasoning across long contexts</p></li><li><p>Tasks requiring fresh real-world data</p></li></ul><p>And genuinely excellent at:</p><ul><li><p>First drafts of anything</p></li><li><p>Translating between formats</p></li><li><p>Explaining complex concepts simply</p></li></ul><p>Use them accordingly.</p>`,
            topicSlugs: ["artificial-intelligence", "machine-learning", "hot-takes"],
        },
    ];

async function seed() {
    console.log("🌱 Seeding posts...");

    // Collect all unique slugs needed
    const allSlugs = [...new Set(SEED_POSTS.flatMap((p) => p.topicSlugs))];

    // Fetch topic id→slug map from DB
    const topicRows = await db
        .select({ id: topics.id, slug: topics.slug })
        .from(topics)
        .where(inArray(topics.slug, allSlugs));

    const slugToId = Object.fromEntries(topicRows.map((t) => [t.slug, t.id]));

    const missing = allSlugs.filter((s) => !slugToId[s]);
    if (missing.length > 0) {
        console.warn("⚠️  Missing topic slugs (will be skipped):", missing.join(", "));
    }

    let inserted = 0;
    for (const p of SEED_POSTS) {
        const [post] = await db
            .insert(posts)
            .values({ content: p.content, profileId: p.profileId })
            .returning({ id: posts.id });

        const topicIds = p.topicSlugs
            .map((s) => slugToId[s])
            .filter(Boolean) as string[];

        if (topicIds.length > 0) {
            await db
                .insert(postTopics)
                .values(topicIds.map((topicId) => ({ postId: post.id, topicId })))
                .onConflictDoNothing();
        }

        inserted++;
    }

    console.log(`✅ ${inserted} posts seeded with topics`);
    process.exit(0);
}

seed().catch((e) => {
    console.error("❌", e);
    process.exit(1);
});
