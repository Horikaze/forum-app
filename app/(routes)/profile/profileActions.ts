"use server";
import { saveFile } from "@/app/utils/testingFunctions";
import db from "@/lib/db";
import {
  getUserSessionCreate,
  getUserSessionCreate as getUserSessionServer,
} from "@/lib/globalActions";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import axios from "axios";
import { ReplayApiInfo } from "@/app/types/gameTypes";
import {
  getCharacterFromData,
  getGameNumberFromReplayName,
} from "@/app/utils/replayUtils";
import { achievementRankValues } from "@/app/constants/games";
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
    const session = await getUserSessionServer();
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
    revalidatePath(`/profile`);
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
    const session = await getUserSessionCreate();
    const res = await saveFile(file);
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        [target]: res,
      },
    });

    revalidatePath("/profile");
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
    const session = await getUserSessionServer();
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
    revalidatePath(`/profile`);
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

export const sendReplayAction = async (
  rpyData: ReplayApiInfo,
  file: File,
  userInput: { comment: string; achievement: string; fileDate: number },
) => {
  try {
    if (userInput.comment.length > 300) {
      throw new Error("Komentarz musi mieć nie więcej niż 300 znaków");
    }
    const session = await getUserSessionServer();
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    await db.replay.create({
      data: {
        achievement: achievementRankValues[userInput.achievement],
        character: getCharacterFromData(rpyData),
        file: fileBuffer,
        game: getGameNumberFromReplayName(rpyData.rpyName),
        player: rpyData.player,
        rank: rpyData.rank,
        rpyName: rpyData.rpyName,
        score: rpyData.stageScore.at(-1)!,
        stageScore: rpyData.stageScore.join("+"),
        comment: userInput.comment,
        userId: session.user.id,
        shottype: rpyData.shotType,
        slowRate: rpyData.slowRate ? rpyData.slowRate.toString() : "0",
        stage: rpyData.stage,
        replayDate: rpyData.date,
        fileDate: new Date(userInput.fileDate),
      },
    });
    return {
      success: true,
      message: `ok`,
    };
  } catch (error) {
    return {
      success: false,
      message: `${error}`,
    };
  }
};
