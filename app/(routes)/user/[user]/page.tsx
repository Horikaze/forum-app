import db from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

export default async function UserPage({
  params,
}: {
  params: { user: string };
}) {
  const user = await db.user.findFirst({
    where: {
      id: params.user,
    },
  });
  if (!user) notFound();
  return <div>{params.user}</div>;
}
