"use server";
import { saveFile } from "@/app/utils/testingFunctions";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import axios from "axios";
import { ReplayApiInfo, ScoreObject } from "@/app/types/gameTypes";
import {
  getCharacterFromData,
  getGameNumberFromReplayName,
  getGameString,
} from "@/app/utils/replayUtils";
import { achievementRankValues } from "@/app/constants/games";
import { File as FileBuffer } from "buffer";
import { Replay } from "@prisma/client";
import { getUserSessionCreate } from "@/lib/globalActions";
import { nanoid } from "nanoid";
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

export const changeProfileImageAction = async (file: File, target: string) => {
  try {
    const { session } = await getUserSessionCreate();
    const res = await saveFile(file);
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        [target]: res,
      },
    });

    revalidatePath(`/profile`, "page");
    return {
      success: true,
      message: res,
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
    console.log("123");
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

const changeRanking = async (newReplay: Replay) => {
  try {
    const sameReplay = await db.replay.findFirst({
      where: {
        game: newReplay.game,
        rank: newReplay.rank,
        userId: newReplay.userId,
        replayId: { not: newReplay.replayId },
      },
      orderBy: [{ achievement: "desc" }, { score: "desc" }],
    });

    const gameString = getGameString(
      getGameNumberFromReplayName(newReplay.rpyName),
    );
    const currentRanking = await db.table.findFirst({
      where: { userId: newReplay.userId },
      select: { [gameString]: true },
    });

    if (!currentRanking) throw new Error("Nie masz tabelki");

    const rankingObject: ScoreObject = JSON.parse(currentRanking[gameString]);
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
      await db.user.update({
        where: { id: newReplay.userId },
        data: { cc: { increment: 1 } },
      });
    }

    const shouldUpdateRanking =
      !sameReplay ||
      sameReplay.achievement <= newReplay.achievement ||
      sameReplay.score <= newReplay.score;

    if (shouldUpdateRanking) {
      await db.table.update({
        where: { userId: newReplay.userId },
        data: { [gameString]: JSON.stringify(newScoreObj) },
      });
    }
  } catch (error) {
    throw new Error(`${error}`);
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

    if (!replayToDelete) throw new Error("Nie znaleziono rpy");

    if (
      user.role !== "ADMIN" &&
      user.role !== "MODERATOR" &&
      session.user.id !== replayToDelete.userId
    ) {
      throw new Error("Nie masz uprawneń do tego rpy");
    }

    const deletedReplay = await db.replay.delete({ where: { replayId } });
    const gameString = getGameString(
      getGameNumberFromReplayName(deletedReplay.rpyName),
    );

    const currentRanking = await db.table.findFirst({
      where: { userId: deletedReplay.userId },
      select: { [gameString]: true },
    });

    if (!currentRanking) throw new Error("Nie masz tabelki");

    const rankingObject: ScoreObject = JSON.parse(currentRanking[gameString]);

    if (
      rankingObject[deletedReplay.rank.toUpperCase()]!.id !==
      deletedReplay.replayId
    ) {
      return { success: true, message: "ok" };
    }

    const newScoreObj: ScoreObject = {
      ...rankingObject,
      [deletedReplay.rank.toUpperCase()]: { score: 0, id: "", CC: 0, char: "" },
    };

    await db.table.update({
      where: { userId: deletedReplay.userId },
      data: { [gameString]: JSON.stringify(newScoreObj) },
    });

    await db.user.update({
      where: { id: deletedReplay.userId },
      data: { cc: { decrement: 1 } },
    });

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
    return { success: true, message: "ok" };
  } catch (error) {
    error instanceof Error ? error.message : error;
    return { success: false, message: `${error}` };
  }
};
