"use server";

import { RequestStatus, UserRole } from "@/app/constants/forum";
import db from "@/lib/db";
import { getUserSession } from "@/lib/globalActions";
import { revalidateTag } from "next/cache";

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
        res.userId === session.session.user.id
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

type addAchievementActionProps = {
  userId: string;
  achievementId: number;
  action: "add" | "delete";
};

export const addAchievementAction = async ({
  achievementId,
  userId,
  action,
}: addAchievementActionProps) => {
  try {
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new Error("Użytkownik nie istnieje");
    }
    const session = await getUserSession(true);
    if (action === "add") {
      await db.$transaction(async (tx) => {
        const res = await tx.achievement.findFirst({
          where: {
            achievementId,
            userId: userId,
          },
        });
        if (res) {
          throw new Error("Użytkownik ma już to osiągnięcie");
        }
        await tx.achievement.create({
          data: {
            achievementId,
            userId: userId,
          },
        });
      });
    } else {
      await db.achievement.deleteMany({
        where: {
          achievementId,
          userId: userId,
        },
      });
    }
    revalidateTag(userId);
    return {
      success: true,
      message: `Ok`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Nieznany błąd";
    return {
      success: false,
      message: `${errorMessage}`,
    };
  }
};
