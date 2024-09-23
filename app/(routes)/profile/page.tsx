import { testAchiv } from "@/app/constants/testing";
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import AchievementsList from "./components/AchievementsList";
import AddReplay from "./components/AddReplay";
import CCTable from "./components/CCTable";

export default async function Profile() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      table: true,
    },
  });
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AchievementsList achievements={testAchiv} />
      <CCTable table={user.table!} />
      <AddReplay />
    </div>
  );
}
