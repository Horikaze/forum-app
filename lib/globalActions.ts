"use server";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "./db";
import { UserRole } from "@/app/constants/forum";
import { revalidateTag, unstable_cache } from "next/cache";

export const setCookie = async (key: string, value: string) => {
  cookies().set(key, value);
};
export default async function redirectHard(uri: string) {
  redirect(uri);
}

export const getUserSessionCreate = async (isAdmin: boolean = false) => {
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
    const { session } = await getUserSessionCreate();
    await db.request.create({
      data: {
        userId: session?.user.id,
        message,
      },
    });
    revalidateTag(session.user.id + "recent");
    return {
      success: true,
      message: `Wysłano`,
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
