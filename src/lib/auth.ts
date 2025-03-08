import { profile, TPronouns, users } from "@/db/schema";
import { compareSync } from "bcryptjs";
import { eq, getTableColumns } from "drizzle-orm";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import db from "./db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  deleteServerCookie,
  getServerCookie,
  setUserIsOnboarded,
  userExists,
} from "./server-actions";
import { error } from "console";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id: string;
    image: string;
    username: string;
    profileId: string;
    website?: string;
    pronouns?: "he/him" | "she/her" | "they/them" | "other";
    location?: string;
    bio?: string;
    age?: number;
    emoji?: string;
    isOnboarded: boolean;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      isOnboarded: boolean;
      profileId: string;
      website?: string;
      pronouns?: "he/him" | "she/her" | "they/them" | "other";
      location?: string;
      bio?: string;
      age?: number;
      emoji?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "database",
  },
  callbacks: {
    session: async (data) => {
      let { user, session, newSession, trigger } = data;
      // console.log({ data });
      if (!user?.id) {
        return session;
      }
      const { ...rest } = getTableColumns(profile);
      const userData = await db
        .select({ isOnboarded: users.isOnboarded, ...rest })
        .from(users)
        .leftJoin(profile, eq(profile.userId, users.id))
        .where(eq(users.id, user.id))
        .limit(1);
      // console.log({ userData });
      if (userData.length === 0) {
        console.log("User not found", session);
        return session;
      }
      session.user.id = user?.id as string;
      session.user.isOnboarded = userData[0].isOnboarded as boolean;
      session.user.profileId = userData[0].id as string;
      session.user.username = userData[0].username as string;
      session.user.website = userData[0].website as string;
      session.user.pronouns = userData[0].pronouns as TPronouns;
      session.user.location = userData[0].location as string;
      session.user.bio = userData[0].bio as string;
      session.user.age = userData[0].age as number;

      return session;
    },
    signIn: async (data) => {
      const { user } = data;
      if (!user?.id) return false;
      try {
        const existingProfile = await db
          .select({ username: profile.username })
          .from(profile)
          .where(eq(profile.userId, user.id))
          .limit(1);

        console.log({ existingProfile });
        if (existingProfile.length === 0) {
          const username = await getServerCookie("username");
          console.log({ username });
          if (username) {
            // Create a new profile with the claimed username
            await db.insert(profile).values({
              userId: user.id,
              username: username,
            });

            // Remove stored username after creating the profile
            await deleteServerCookie("username");
          } else {
            console.error("No username found");
            return "/onboarding";
          }
        } else {
          return `/${existingProfile[0]?.username}`;
        }

        return true;
      } catch (error) {
        console.error("Error creating profile:", error);
        return false;
      }
    },
  },
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Github,
    Credentials({
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { password, email } = credentials;
          const exists = await userExists(email as string);

          if (!exists) {
            console.log({ Message: "User not found" });
            throw new Error("User with not found");
          }
          const match = compareSync(
            password as string,
            exists?.password as string
          );
          if (!match) {
            console.log({ Message: "Password does not match" });
            throw new Error("Password does not match");
          }
          return exists;
        } catch (error) {
          // if (error instanceof Error) {
          return null;
        }
      },
    }),
  ],
  trustHost: true,
  adapter: DrizzleAdapter(db),
});
// import { account, profile, session, user, verification } from "@/db/schema";
// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import db from "./db";

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "pg",
//     schema: {
//       user,
//       session,
//       account,
//       verification,
//       profile,
//     },
//   }),
//   // hooks: {
//   // after: createAuthMiddleware(async (ctx) => {
//   //   // console.log({ after: ctx });
//   //   if (ctx.path !== "/sign-in/social") return;
//   //   const username = (await cookies()).get("username")?.value;
//   //   console.log(username);
//   //   if (!username) {
//   //     console.log("Username not found");
//   //     return;
//   //   }
//   //   const session = await auth.api.getSession({
//   //     headers: await headers(),
//   //   });
//   //   console.log({ session });
//   //   const [pro] = await db
//   //     .insert(profile)
//   //     .values({
//   //       username: username as string,
//   //     })
//   //     .returning({ id: profile.id });

//   //   await db.insert(userToProfile).values({
//   //     profileId: pro.id,
//   //     userId: session?.user?.id as string,
//   //   });
//   // }),
//   // before: createAuthMiddleware(async (ctx) => {
//   //   // if(ctx.path==="//sign-in/social"){
//   //   //   ctx.response.redirect("/api/auth/callback")
//   //   // }
//   //   console.log({ p: ctx.path });
//   // }),
//   // },
//   trustedOrigins: ["http://localhost:3000/api/auth"],
//   emailAndPassword: {
//     enabled: true, // If you want to use email and password auth
//   },
//   socialProviders: {
//     github: {
//       clientId: process.env.GITHUB_CLIENT_ID as string,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//     },
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     },
//   },
// });

// // docker run -d --name stacks-postgres-container   -e POSTGRES_PASSWORD=ashwin123 -e POSTGRES_DB=db -v stacks-postgres-volume:/var/lib/postgresql/data   -p 5432:5432 postgres

// async jwt(data) {
//   const { token, user, account, trigger, session } = data;
//   if (user) {
//     token.id = user.id as string;
//     const username = await db
//       .select()
//       .from(profile)
//       .where(eq(profile.userId, user?.id as string))
//       .limit(1);
//     token.username = username[0].username as string;
//     token.profileId = username[0].id as string;
//   }

//   if (trigger === "update") {
//     console.log("Update is called in JWT", session);

//     token.image = session?.image ?? token.image;
//     token.username = session?.username ?? token.username;
//     token.website = session?.website ?? token.website;
//     token.pronouns = session?.pronouns ?? token.pronouns;
//     token.location = session?.location ?? token?.location;
//     token.bio = session?.bio ?? token?.bio;
//     token.age = session?.age ?? token?.age;
//     token.emoji = session?.emoji ?? token?.emoji;
//     token.email = session?.email ?? token?.email;
//     token.name = session?.name ?? token.name;
//     token.isOnboarded = session?.isOnboarded ?? token.isOnboarded;

//     console.log("returning token", token);
//   }

//   // if (id) {
//   //   console.log("updating username in JWT");
//   //   const username = await db
//   //     .select()
//   //     .from(profile)
//   //     .where(eq(profile.userId, id))
//   //     .limit(1);
//   //   if (!username[0]) {
//   //     console.log("Username not found");
//   //     return token;
//   //   }
//   //   token.username = username[0].username!;
//   //   return token;
//   // }

//   return token;
// },
