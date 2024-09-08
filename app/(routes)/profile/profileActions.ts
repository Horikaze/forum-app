"use server";
import { saveFile } from "@/app/utils/testingFunctions";
import db from "@/lib/db";
import {
  getUserSessionCreate,
  getUserSessionCreate as getUserSessionServer,
} from "@/lib/globalActions";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const registerSchema = z.object({
  nickname: z
    .string()
    .min(3, { message: "Nick musi składać się z co najmniej 3 znaków." })
    .max(15, { message: "Nick nie może zawierać więcej niż 15 znaków." }),
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

export const changeProfileImageAction = async (file: File) => {
  try {
    const session = await getUserSessionCreate();
    const res = await saveFile(file);
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        profileImage: res,
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
