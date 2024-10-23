"use server";
import { UserRole } from "@/app/constants/forum";
import { auth } from "@/auth";
import { revalidateTag, unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "./db";

export const setCookie = async (key: string, value: string) => {
  (await cookies()).set(key, value);
};
export default async function redirectHard(uri: string) {
  redirect(uri);
}

export const getUserSession = async (isAdmin: boolean = false) => {
  const session = await auth();
  if (!session) {
    throw new Error("Nie zalogowano");
  }
  const user = await db.user.findFirst({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user) {
    throw new Error("Nie znaleziono użytkownika");
  }
  const { role } = user;
  if (role === UserRole.BLOCKED) {
    throw new Error("Nie masz uprawnień");
  }
  if (isAdmin && role !== UserRole.ADMIN && role !== UserRole.MODERATOR) {
    throw new Error("Nie masz uprawnień do operacji administracyjnych");
  }
  return { session, user };
};

export const sendRequestAction = async (message: string) => {
  try {
    const { session } = await getUserSession();
    const res = await db.request.create({
      data: {
        userId: session?.user.id,
        message,
      },
      select: {
        userId: true,
      },
    });
    revalidateTag(session.user.id + "recent");
    return {
      success: true,
      message: res.userId,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};
export async function getProfileUserData(userId: string) {
  return await unstable_cache(
    async () => {
      console.log(userId + "profile");
      return await db.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          _count: {
            select: {
              comments: true,
              posts: true,
            },
          },
          table: true,
          replay: true,
        },
      });
    },
    [userId],
    {
      revalidate: 10,
      tags: [userId],
    },
  )();
}
