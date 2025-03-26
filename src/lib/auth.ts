import { profile, users } from "@/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compareSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import db from "./db";
import {
  deleteServerCookie,
  getServerCookie,
  userExists,
} from "./server-actions";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id: string;
    image: string;
    username: string;
    profileId: string;
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
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        const userData = await db
          .select({ isOnboarded: users.isOnboarded })
          .from(users)
          .where(eq(users.id, user.id!))
          .limit(1);

        token.isOnboarded = userData[0]?.isOnboarded || false;
      }

      if (trigger === "update" && session) {
        console.log({ session });
        return { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, user }) {
      if (!user) {
        return session;
      }

      const userData = await db
        .select({
          isOnboarded: users.isOnboarded,
          username: profile.username,
          profileId: profile.id,
        })
        .from(users)
        .leftJoin(profile, eq(profile.userId, users.id))
        .where(eq(users.id, user.id))
        .limit(1);

      if (!userData[0]) {
        return session;
      }

      session.user = {
        ...session.user,
        id: user.id,
        ...(userData[0] as any),
      };

      return session;
    },
    signIn: async (data) => {
      const { user } = data;
      if (!user?.id) return false;

      const existingProfile = await db
        .select({ username: profile.username })
        .from(profile)
        .where(eq(profile.userId, user.id))
        .limit(1);

      if (existingProfile.length > 0) {
        return true;
      }

      // Check for username cookie if no profile exists
      const username = await getServerCookie("username");
      // console.log("no username found");
      if (username) {
        // Create profile with cookie username
        await db.insert(profile).values({
          userId: user.id,
          username: username,
        });

        // Clear username cookie
        await deleteServerCookie("username");
      }

      return true;
    },
    redirect: async (data) => {
      const { url, baseUrl } = data;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
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
});
