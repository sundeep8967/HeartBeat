import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
  }

  interface JWT {
    accessToken?: string;
    userId?: string;
  }

  interface User {
    isProfileComplete?: boolean;
  }
}

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      
      // Fetch user profile completeness
      if (token.userId) {
        const user = await db.user.findUnique({
          where: { id: token.userId as string },
          select: { isProfileComplete: true }
        });
        if (user) {
          session.user.isProfileComplete = user.isProfileComplete;
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt" as const,
  },
};

export default NextAuth(authOptions);