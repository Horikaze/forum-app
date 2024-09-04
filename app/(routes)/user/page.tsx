import db from "@/lib/db";
import React from "react";

export default async function AllUsersPage() {
  const allUser = await db.user.findMany();
  return <div>{allUser.length}</div>;
}
