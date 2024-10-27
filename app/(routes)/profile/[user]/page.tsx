import { testAchiv } from "@/app/constants/testing";
import { auth } from "@/auth";
import { getProfileUserData } from "@/lib/globalActions";
import { notFound } from "next/navigation";
import AchievementsList from "../components/AchievementsList";
import AddReplay from "../components/AddReplay";
import CCTable from "../components/CCTable";
import ProfileLayoutComponent from "../components/ProfileLayoutComponent";
import { forumAchievements } from "@/app/constants/forumAchievements";
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
  const userAchievementIds = user.achievements.map((a) => a.achievementId);

  const filteredAchievements = forumAchievements.filter(
    (achievement) =>
      userAchievementIds.indexOf(achievement.id) !== -1 &&
      userAchievementIds.splice(userAchievementIds.indexOf(achievement.id), 1),
  );
  return (
    <div className="flex w-full flex-col">
      <ProfileLayoutComponent user={user} isMine={isMine} />
      <AchievementsList achievements={filteredAchievements} isMine={isMine} />
      <CCTable table={user.table!} />
      {isMine ? <AddReplay /> : null}
    </div>
  );
}
