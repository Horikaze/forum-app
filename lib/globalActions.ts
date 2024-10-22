"use server";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "./db";
import { RequestStatus, UserRole } from "@/app/constants/forum";
import { revalidateTag, unstable_cache } from "next/cache";

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
export type actionRequestType = "delete" | "approve" | "reject";
export const editRequestAction = async (
  id: string,
  type: actionRequestType,
) => {
  try {
    let session = await getUserSession(type === "reject" || type === "approve");
    const res = await db.request.findFirst({
      where: {
        id: id,
      },
      select: { userId: true },
    });
    if (!res) throw new Error("Nie znaleziono");
    if (type === "delete") {
      if (
        (session!.user.role !== UserRole.ADMIN &&
          session!.user.role !== UserRole.MODERATOR) ||
        res?.userId === session.session.user.id
      ) {
        await db.request.delete({
          where: {
            id: id,
          },
        });
      }
    }
    if (type === "approve") {
      await db.request.update({
        where: {
          id: id,
        },
        data: {
          status: RequestStatus.APPROVED,
        },
      });
    }
    if (type === "reject") {
      await db.request.update({
        where: {
          id: id,
        },
        data: {
          status: RequestStatus.REJECTED,
        },
      });
    }
    revalidateTag(res.userId + "recent");
    return {
      success: true,
      message: `Ok`,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};
