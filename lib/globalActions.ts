"use server";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "./db";

export const setCookie = async (key: string, value: string) => {
  cookies().set(key, value);
};
export default async function redirectHard(uri: string) {
  redirect(uri);
}

export const getUserSessionCreate = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("Nie zalogowano");
  }
  const res = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });
  if (res?.role === "BLOCKED") {
    throw new Error("Nie masz uprawnień");
  }
  return session;
};
