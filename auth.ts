import { LoginProvider, User, UserRole } from "@prisma/client";
import bcryptjs from "bcryptjs";
import NextAuth, { AuthError } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Github from "next-auth/providers/github";
import db from "./lib/db";
import {
  emptyScoreObject,
  emptyScoreObjectNewUser,
} from "./app/constants/games";
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      id: string;
      image?: string;
      role?: string;
    };
  }
  interface User {
    password?: string;
    isLogin?: boolean;
  }
}
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    user: User;
  }
}
export const getUserId = (input: string) => {
  input += process.env.AUTH_SECRET;
  try {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 10);
  } catch (error) {
    return "null";
  }
};
type Credentials = {
  nickname: string;
  password: string;
  isLogin: string;
};

const PROTECTED_ROUTES = ["/profile", "/forum/new"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord,
    Github,
    Credentials({
      name: `credentials`,
      credentials: {
        nickname: { label: `nickname`, type: "text" },
        password: { label: "password", type: "password" },
        isLogin: { label: "isLogin", type: "string" },
      },
      async authorize(credentials) {
        const { nickname, password, isLogin } =
          credentials as Partial<Credentials>;
        return {
          name: nickname,
          password: password,
          isLogin: isLogin == "true" ? true : false,
        };
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth, request }) => {
      const { pathname } = request.nextUrl;
      if (PROTECTED_ROUTES.includes(pathname)) return !!auth;
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.nickname) {
        token.user.nickname = session.nickname;
        return token;
      }
      if (trigger === "update" && session?.profileImage) {
        token.user.profileImage = session.profileImage;
        return token;
      }
      if (!user) return token;

      let provider;
      switch (account?.provider) {
        case "github":
          provider = LoginProvider.GITHUB;
          break;
        case "discord":
          provider = LoginProvider.DISCORD;
          break;
        default:
          provider = LoginProvider.CREDENTIALS;
          break;
      }
      const generatedId = getUserId(user.email || user.name!);

      token.id = generatedId;

      const isUserExist = await db.account.findUnique({
        relationLoadStrategy: "join",
        where: {
          id: generatedId,
        },
        include: {
          user: true,
        },
      });
      let hashedPassword = null;
      if (provider === "CREDENTIALS") {
        if (user?.isLogin && !isUserExist) {
          throw new AuthError("Użytkownik nie istnieje");
        }
        hashedPassword = await bcryptjs.hash(user.password!, 12);
        if (isUserExist && isUserExist.hashedPassword) {
          const isValidPass = await bcryptjs.compare(
            user.password!,
            isUserExist.hashedPassword!,
          );
          if (isValidPass && isUserExist.hashedPassword) {
            token.picture = isUserExist.user.profileImage || null;
            token.user = isUserExist.user;
            return token;
          } else if (isUserExist && !user.isLogin) {
            throw new AuthError("Konto już istnieje");
          } else {
            throw new AuthError("Nieprawidłowe dane");
          }
        }
      }
      if (!isUserExist) {
        try {
          const newUser = await db.user.create({
            relationLoadStrategy: "join",
            data: {
              id: generatedId,
              nickname: user.name!,
              profileImage: user.image || null,
              account: {
                create: {
                  loginProvider: provider,
                  hashedPassword,
                },
              },
              table: {
                create: emptyScoreObjectNewUser,
              },
            },
          });
          token.user = newUser;
          return token;
        } catch (error) {
          throw new AuthError("Błąd servera");
        }
      }
      token.user = isUserExist.user;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      //@ts-ignore delete email, it shouldn't break ye?
      delete session.user.email;
      session.user.role = token.user.role;
      session.user.name = token.user.nickname;
      session.user.image = token.user.profileImage || undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
});
