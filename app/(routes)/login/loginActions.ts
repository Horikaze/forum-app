"use server";
import { signIn } from "@/auth";
import * as z from "zod";
const registerSchema = z
  .object({
    nickname: z
      .string()
      .min(3, { message: "Nazwa musi składać się z co najmniej 3 znaków." })
      .max(15, { message: "Nazwa nie może zawierać więcej niż 15 znaków." }),
    password: z
      .string()
      .min(3, { message: "Hasło musi składać się z co najmniej 3 znaków." })
      .refine(
        (value) => value.length <= 15,
        (value) => ({
          message: `Hasło nie może zawierać więcej niż 15 znaków. (${value.length})`,
        }),
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być takie same.",
    path: ["confirmPassword"],
  });

export const loginUserAction = async (formData: FormData) => {
  let nickname = "";
  let password = "";
  let confirmPassword = "";
  try {
    nickname = formData.get("nickname") as string;
    password = formData.get("password") as string;
    confirmPassword = (formData.get("confirmPassword") as string) || "";
    const isLogin =
      (formData.get("isLogin") as string) === "true" ? true : false;
    const user = {
      nickname,
      password,
      confirmPassword,
    };
    if (!isLogin) {
      const result = registerSchema.safeParse(user);
      if (!result.success) {
        const errorMessage = result.error.issues
          .map((issue) => issue.message)
          .join(" ");
        throw new Error(errorMessage);
      }
    }
    await signIn("credentials", {
      nickname: nickname,
      password: password,
      isLogin,
      redirect: false,
    });
    return {
      success: true,
      message: "ok",
    };
  } catch (error) {
    if (`${error}`.startsWith("AuthError")) {
      error = `${error}`.substring("AuthError:".length).split(".")[0].trim();
    }
    return {
      success: false,
      message:
        // @ts-ignore
        error.code === "P2002" ? "Użytkownik już istnieje" : `${error}`,
    };
  }
};

export const loginWithProvider = async (
  provider: string,
  redirectTo: string,
) => {
  if (redirectTo === "/login") {
    redirectTo = "/";
  }
  await signIn(provider, {
    redirectTo: redirectTo,
  });
};
