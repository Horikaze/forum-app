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
  if (role === "BLOCKED") {
    throw new Error("Nie masz uprawnień");
  }
  if (isAdmin && role !== "ADMIN" && role !== "MODERATOR") {
    throw new Error("Nie masz uprawnień do operacji administracyjnych");
  }
  return { session, user };
};
