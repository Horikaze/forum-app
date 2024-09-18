"use server";
import { UserRole, validFileExtensions } from "@/app/constants/forum";
import { achievementRankValues } from "@/app/constants/games";
import { ReplayApiInfo, ScoreObject } from "@/app/types/gameTypes";
import {
  getCharacterFromData,
  getGameNumberFromReplayName,
  getGameString,
} from "@/app/utils/replayUtils";
import { deleteFile, saveFile } from "@/app/utils/testingFunctions";
import { auth } from "@/auth";
import db from "@/lib/db";
import { getUserSessionCreate } from "@/lib/globalActions";
import { Replay } from "@prisma/client";
import axios from "axios";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import * as z from "zod";
const registerSchema = z.object({
  nickname: z
    .string()
    .min(3, { message: "Nick musi składać się z co najmniej 3 znaków." })
    .refine(
      (value) => value.length <= 15,
      (value) => ({
        message: `Nick nie może zawierać więcej niż 15 znaków. (${value.length})`,
      }),
    ),
});

export const changeNicknameAction = async (nickname: string) => {
  try {
    const { session } = await getUserSessionCreate();
    const result = registerSchema.safeParse({ nickname });
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        nickname,
      },
    });
    revalidatePath(`/profile`, "page");
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message:
        // @ts-ignore
        error.code === "P2002" ? "Nick jest zajęty" : `${error}`,
    };
  }
};

const profileImageSchema = z.object({
  file: z
    .any()
    .refine(
      (file) => file.size <= 2000 * 1024,
      (file: any) => ({
        message: `Plik musi być mniejszy niż 2MB. (${Number(file.size / 1024).toFixed()}KB)`,
      }),
    )
    .refine(
      (file: any) => {
        return validFileExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        );
      },
      {
        message: `Dozwolone rozszerzenia to: ${validFileExtensions.join(", ")}`,
      },
    ),
});
export const changeProfileImageAction = async (file: File, target: string) => {
  try {
    const { session } = await getUserSessionCreate();
    const result = profileImageSchema.safeParse({ file });
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }

    const message = await db.$transaction(async (tx) => {
      const prevImage = await tx.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          [target]: true,
        },
      });
      if (prevImage && typeof prevImage[target] === "string") {
        await deleteFile(prevImage[target]);
      }
      const res = await saveFile(file);
      await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          [target]: res,
        },
      });
      return res;
    });

    revalidatePath(`/profile`, "page");
    return {
      success: true,
      message: message,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};
const descriptionSchema = z.object({
  description: z
    .string()
    .min(3, { message: "Opis musi składać się z co najmniej 3 znaków." })
    .refine(
      (value) => value.length <= 900,
      (value) => ({
        message: `Opis nie może zawierać więcej niż 900 znaków. (${value.length})`,
      }),
    ),
});
export const changeDescriptionAction = async (description: string) => {
  try {
    const { session } = await getUserSessionCreate();
    const result = descriptionSchema.safeParse({ description });
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        description,
      },
    });
    revalidatePath(`/profile`, "page");
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};

export const removeProfileImageAction = async (target: string) => {
  try {
    const { session } = await getUserSessionCreate();
    await db.$transaction(async (tx) => {
      const imageToDelete = await tx.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          [target]: true,
        },
      });
      await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          [target]: null,
        },
      });
      if (imageToDelete && typeof imageToDelete[target] === "string") {
        await deleteFile(imageToDelete[target]);
      }
    });
    revalidatePath(`/profile`, "page");
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};

export const getRpyDataAction = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("replay", file);
    const res = await axios.post(process.env.RPY_API as string, formData);
    return {
      success: true,
      message: res.data as ReplayApiInfo,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};

const replaySchema = z.object({
  comment: z.string().refine(
    (value) => value.length <= 300,
    (value) => ({
      message: `Komentarz nie może zawierać więcej niż 300 znaków. (${value.length})`,
    }),
  ),
  file: z
    .any()
    .refine((file) => file.size <= 200 * 1024, {
      message: "Plik musi być mniejszy niż 200KB",
    })
    .refine((file) => file.name.endsWith(".rpy"), {
      message: "Dozwolone rozszerzenie to: .rpy",
    }),
});

export const sendReplayAction = async (
  rpyData: ReplayApiInfo,
  file: File,
  userInput: { comment: string; achievement: string; fileDate: number },
) => {
  try {
    const result = replaySchema.safeParse({ comment: userInput.comment, file });
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      throw new Error(errorMessage);
    }

    const existingRpy = await db.replay.findFirst({
      where: { stageScore: rpyData.stageScore.join("+") },
    });
    if (existingRpy) throw new Error("Replay już istnieje");

    const { session } = await getUserSessionCreate();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const newReplay = await db.replay.create({
      data: {
        replayId: nanoid(10),
        userId: session.user.id,
        achievement: achievementRankValues[userInput.achievement],
        character: getCharacterFromData(rpyData),
        file: buffer,
        game: getGameNumberFromReplayName(rpyData.rpyName),
        player: rpyData.player.replace(/[^\x20-\x7E]/g, ""),
        rank: rpyData.rank,
        rpyName: rpyData.rpyName,
        score: rpyData.stageScore.at(-1)!,
        stageScore: rpyData.stageScore.join("+"),
        comment: userInput.comment,
        shotType: rpyData.shotType,
        slowRate: rpyData.slowRate?.toString() ?? "0",
        stage: rpyData.stage,
        replayDate: rpyData.date,
        fileDate: new Date(userInput.fileDate),
      },
    });

    await changeRanking(newReplay);
    revalidatePath(`/profile`);
    return { success: true, message: "Dodano replay!" };
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : error;
    return { success: false, message: `${errorMessage}` };
  }
};

const updateUserCC = async (userId: string, increment: boolean) => {
  await db.user.update({
    where: { id: userId },
    data: { cc: { [increment ? "increment" : "decrement"]: 1 } },
  });
};

const updateRanking = async (
  userId: string,
  gameString: string,
  newScoreObj: ScoreObject,
) => {
  await db.table.update({
    where: { userId },
    data: { [gameString]: JSON.stringify(newScoreObj) },
  });
};

const findSameReplay = async (newReplay: Replay) => {
  return db.replay.findFirst({
    where: {
      game: newReplay.game,
      rank: newReplay.rank,
      userId: newReplay.userId,
      replayId: { not: newReplay.replayId },
    },
    orderBy: [{ achievement: "desc" }, { score: "desc" }],
  });
};

const getCurrentRanking = async (userId: string, gameString: string) => {
  const currentRanking = await db.table.findFirst({
    where: { userId },
    select: { [gameString]: true },
  });

  if (!currentRanking) throw new Error("Ranking not found");
  return JSON.parse(currentRanking[gameString]) as ScoreObject;
};

const changeRanking = async (newReplay: Replay) => {
  try {
    const sameReplay = await findSameReplay(newReplay);
    const gameString = getGameString(
      getGameNumberFromReplayName(newReplay.rpyName),
    );
    const rankingObject = await getCurrentRanking(newReplay.userId, gameString);

    const newScoreObj: ScoreObject = {
      ...rankingObject,
      [newReplay.rank.toUpperCase()]: {
        score: Number(newReplay.score),
        id: newReplay.replayId,
        CC: newReplay.achievement,
        char: getCharacterFromData(newReplay as any as ReplayApiInfo, true),
      },
    };

    if (!sameReplay) {
      await updateUserCC(newReplay.userId, true);
    }

    const shouldUpdateRanking =
      !sameReplay ||
      sameReplay.achievement <= newReplay.achievement ||
      sameReplay.score <= newReplay.score;

    if (shouldUpdateRanking) {
      await updateRanking(newReplay.userId, gameString, newScoreObj);
    }
  } catch (error) {
    throw new Error(`Failed to change ranking: ${error}`);
  }
};

export const deleteReplayAction = async ({
  replayId,
}: {
  replayId: string;
}) => {
  try {
    const { session, user } = await getUserSessionCreate();

    const replayToDelete = await db.replay.findFirst({
      where: { replayId },
      select: { userId: true, rpyName: true },
    });

    if (!replayToDelete) throw new Error("Replay not found");

    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.MODERATOR &&
      session.user.id !== replayToDelete.userId
    ) {
      throw new Error("Insufficient permissions");
    }

    const deletedReplay = await db.replay.delete({ where: { replayId } });
    const gameString = getGameString(
      getGameNumberFromReplayName(deletedReplay.rpyName),
    );
    const rankingObject = await getCurrentRanking(
      deletedReplay.userId,
      gameString,
    );

    if (
      rankingObject[deletedReplay.rank.toUpperCase()]?.id !==
      deletedReplay.replayId
    ) {
      return { success: true, message: "Replay deleted" };
    }

    const newScoreObj: ScoreObject = {
      ...rankingObject,
      [deletedReplay.rank.toUpperCase()]: { score: 0, id: "", CC: 0, char: "" },
    };

    await updateRanking(deletedReplay.userId, gameString, newScoreObj);
    await updateUserCC(deletedReplay.userId, false);

    const replayToReplace = await db.replay.findFirst({
      where: {
        rank: deletedReplay.rank,
        userId: deletedReplay.userId,
        game: deletedReplay.game,
      },
      orderBy: [{ achievement: "desc" }, { score: "desc" }],
    });

    if (replayToReplace) {
      await changeRanking(replayToReplace);
    }

    revalidatePath("/profile", "page");
    return { success: true, message: "Replay deleted and ranking updated" };
  } catch (error) {
    return { success: false, message: `Failed to delete replay: ${error}` };
  }
};
