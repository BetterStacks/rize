import { userExists } from "@/actions/user-actions";
import { profile, users } from "@/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compareSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth, { DefaultSession } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { v4 } from "uuid";
import db from "./db";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id: string;
    image: string;
    username: string;
    profileId: string;
    isOnboarded: boolean;
    displayName: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      isOnboarded: boolean;
      profileId: string;
      profileImage: string;
      displayName: string;
    } & DefaultSession["user"];
  }
}
const adapter = DrizzleAdapter(db);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
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
          profileImage: profile.profileImage,
          displayName: profile.displayName,
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
    // signIn: async (payload) => {
    //   const { user, account } = payload;
    //   const provider = account?.provider;
    //   console.log(payload);
    //   // if (provider === "google" && user?.id) {
    //   //   // const userProfile = await getProfileByUserId(user.id);
    //   //   // console.log({ userProfile });
    //   // }

    //   return true;
    // },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = v4();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Github,
    Credentials({
      name: "Credentials",

      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { password, email } = credentials;
        const exists = await userExists(email as string);

        if (!exists) {
          throw new Error("User with not found");
        }
        const match = compareSync(
          password as string,
          exists?.password as string
        );
        if (!match) {
          throw new Error("Password does not match");
        }

        return exists;
      },
    }),
  ],
  trustHost: true,
});

// async signIn(payload) {
//   const { credentials, account, user } = payload;
//   console.log(payload);
//   const provider = account?.provider;
//   if (provider === "google") {
//     const username = await getServerCookie("username");
//     if (username) {
//       await db.insert(profile).values({
//         userId: user?.id!,
//         username: username,
//       });

//       await deleteServerCookie("username");
//     }
//   }

//   return true;
// },
// signIn: async (data) => {
//   const { user } = data;
//   if (!user?.id) return false;

//   const existingProfile = await db
//     .select({ username: profile.username })
//     .from(profile)
//     .where(eq(profile.userId, user.id))
//     .limit(1);

//   if (existingProfile.length > 0) {
//     return true;
//   }

//   // Check for username cookie if no profile exists

//   return true;
// },
