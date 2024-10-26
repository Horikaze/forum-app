import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import RecentProfile from "../../components/RecentProfile";
import ProfileLayoutComponent from "../../components/ProfileLayoutComponent";
import { getProfileUserData } from "@/lib/globalActions";

export default async function RecentPostsPage(props: {
  params: Promise<{ user: string }>;
}) {
  const params = await props.params;
  const user = await getProfileUserData(params.user);
  if (!user) {
    notFound();
  }
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const isMine = session ? session.user.id === params.user : false;
  return (
    <>
      <ProfileLayoutComponent user={user} isMine={isMine} />
      <RecentProfile userId={session.user.id} isMine={isMine} />
    </>
  );
}
