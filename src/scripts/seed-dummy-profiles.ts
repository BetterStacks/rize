import db from "../lib/db";
import { users, profile } from "../db/schema";
import { v4 } from "uuid";

async function seed() {
    console.log("Seeding dummy profiles...");

    const dummyProfiles = [
        { name: "Aman Solanki", email: "solankiaman@gmail.com", username: "amanwasgood", display: "Aman Solanki" },
        { name: "Sonali Mehta", email: "sonalimehta@gmail.com", username: "workwithsonali", display: "Sonali Mehta" },
        { name: "Hemesh Ghongde", email: "hemesh@gmail.com", username: "hemesh.plays", display: "Hemesh Ghongde" },
    ];
    // const dummyProfiles = [
    //     { name: "Sahil Kapoor", email: "sahil@example.com", username: "sahilkapoor", display: "Sahil K." },
    //     { name: "Ananya Sharma", email: "ananya@example.com", username: "ananyasharma", display: "Ananya S." },
    //     { name: "Rohan Mehra", email: "rohan@example.com", username: "rohanmehra", display: "Rohan M." },
    //     { name: "Priyanka Verma", email: "priyanka@example.com", username: "priyankaverma", display: "Priyanka V." },
    //     { name: "Vikram Singh", email: "vikram@example.com", username: "vikramsingh", display: "Vikram S." },
    //     { name: "Ishaan Malhotra", email: "ishaan@example.com", username: "ishaanmalhotra", display: "Ishaan M." },
    //     { name: "Kavya Iyer", email: "kavya@example.com", username: "kavyaiyer", display: "Kavya I." },
    //     { name: "Arjun Reddy", email: "arjun@example.com", username: "arjunreddy", display: "Arjun R." },
    //     { name: "Tanvi Nair", email: "tanvi@example.com", username: "tanvinair", display: "Tanvi N." },
    //     { name: "Advait Deshmukh", email: "advait@example.com", username: "advaitdeshmukh", display: "Advait D." },
    // ];

    for (const p of dummyProfiles) {
        const [user] = await db.insert(users).values({
            id: v4(),
            name: p.name,
            email: p.email,
        }).onConflictDoUpdate({
            target: users.email,
            set: { name: p.name }
        }).returning({ id: users.id });

        await db.insert(profile).values({
            userId: user.id,
            username: p.username,
            displayName: p.display,
            profileImage: `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(p.name)}`,
        }).onConflictDoUpdate({
            target: profile.username,
            set: {
                displayName: p.display,
                profileImage: `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(p.name)}`
            }
        });
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
