import { testAchiv } from "@/app/constants/testing";
import { auth } from "@/auth";
import { getProfileUserData } from "@/lib/globalActions";
import { notFound } from "next/navigation";
import AchievementsList from "../components/AchievementsList";
import AddReplay from "../components/AddReplay";
import CCTable from "../components/CCTable";
import ProfileLayoutComponent from "../components/ProfileLayoutComponent";

export default async function page(props: {
  params: Promise<{ user: string }>;
}) {
  const params = await props.params;
  const user = await getProfileUserData(params.user);
  if (!user) {
    notFound();
  }
  const session = await auth();
  const isMine = session ? session.user.id === params.user : false;
  return (
    <div className="flex w-full flex-col">
      <ProfileLayoutComponent user={user} isMine={isMine} />
      <AchievementsList achievements={testAchiv} isMine={isMine} />
      <CCTable table={user.table!} />
      {isMine ? <AddReplay /> : null}
    </div>
  );
}
