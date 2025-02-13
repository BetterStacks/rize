import { compareSync } from "bcryptjs";
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import db from "./db";
import {
  deleteServerCookie,
  getServerCookie,
  userExists,
} from "./server-actions";
import { profile } from "@/db/schema";
import { JWT } from "next-auth/jwt";
import { eq } from "drizzle-orm";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id: string;
    image: string;
    username: string;
    website?: string;
    pronouns?: "he/him" | "she/her" | "they/them" | "other";
    location?: string;
    bio?: string;
    age?: number;
    emoji?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
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
    strategy: "jwt",
  },
  callbacks: {
    async jwt(data) {
      const { token, user, account, trigger, session } = data;
      if (user) {
        token.id = user.id as string;
        const username = await db
          .select()
          .from(profile)
          .where(eq(profile.userId, user?.id as string))
          .limit(1);
        token.username = username[0].username as string;
      }

      if (trigger === "update") {
        console.log("Update is called in JWT", session);

        token.image = session?.image ?? token.image;
        token.username = session?.username ?? token.username;
        token.website = session?.website ?? token.website;
        token.pronouns = session?.pronouns ?? token.pronouns;
        token.location = session?.location ?? token?.location;
        token.bio = session?.bio ?? token?.bio;
        token.age = session?.age ?? token?.age;
        token.emoji = session?.emoji ?? token?.emoji;
        token.email = session?.email ?? token?.email;
        token.name = session?.name ?? token.name;
        console.log("returning token", token);
      }

      // if (id) {
      //   console.log("updating username in JWT");
      //   const username = await db
      //     .select()
      //     .from(profile)
      //     .where(eq(profile.userId, id))
      //     .limit(1);
      //   if (!username[0]) {
      //     console.log("Username not found");
      //     return token;
      //   }
      //   token.username = username[0].username!;
      //   return token;
      // }

      return token;
    },
    session: async (data) => {
      let { trigger, user, session, token } = data;
      // console.log({ insideSession: token });
      session.user.id = token.id;
      session.user.image = token.image;
      session.user.username = token.username;
      session.user.website = token.website;
      session.user.pronouns = token.pronouns;
      session.user.location = token.location;
      session.user.bio = token.bio;
      session.user.age = token.age;
      session.user.emoji = token.emoji;
      return session;
    },
    signIn: async (data) => {
      const username = await getServerCookie("username");
      console.log({ username });
      if (username) {
        const u = await db
          .insert(profile)
          .values({
            username: username as string,
            userId: data.user?.id as string,
          })
          .returning();
        if (u.length === 0) {
          console.log("Error in inserting profile");
          return true;
        }
        deleteServerCookie("username");
      }
      return true;
    },
  },
  providers: [
    Google,
    Github,
    Credentials({
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
  // adapter: DrizzleAdapter(db),
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
