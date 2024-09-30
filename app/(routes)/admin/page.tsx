import { UserRole } from "@/app/constants/forum";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (
    !session ||
    (session!.user.role !== UserRole.ADMIN &&
      session!.user.role !== UserRole.MODERATOR)
  ) {
    redirect("/");
  }
  return <div>AdminPage</div>;
}
