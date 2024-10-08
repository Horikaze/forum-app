import { auth } from "@/auth";
import { getProfileUserData } from "@/lib/globalActions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileLayoutComponent from "./moreinfo/ProfileLayoutComponent";
export const metadata: Metadata = {
  title: "Mój profil",
};

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  const user = await getProfileUserData(session.user.id);
  if (!user) {
    redirect("/");
  }
  return (
    <>
      <ProfileLayoutComponent user={user} isMine={false} />
      {children}
    </>
  );
}
