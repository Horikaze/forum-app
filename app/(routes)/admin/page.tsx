import { RequestComponent } from "@/app/components/RequestComponent";
import { RequestStatus, UserRole } from "@/app/constants/forum";
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ChangeAchievements from "./components/ChangeAchievements";
import { revalidateTag } from "next/cache";

export default async function AdminPage() {
  const session = await auth();
  if (
    !session ||
    (session!.user.role !== UserRole.ADMIN &&
      session!.user.role !== UserRole.MODERATOR)
  ) {
    redirect("/");
  }
  const requests = await db.request.findMany({
    where: {
      status: {
        not: RequestStatus.APPROVED,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="flex flex-col">
      <form
        className="self-end"
        action={async () => {
          "use server";
          revalidateTag("recent");
        }}
      >
        <button type="submit" className="btn btn-primary btn-sm">
          Revalidate recent
        </button>
      </form>{" "}
      <div className="relative mt-5 max-h-72 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Zapytania</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {requests.map((req, idx) => (
            <RequestComponent isAdmin={true} req={req} key={idx} />
          ))}
        </div>
      </div>
      <ChangeAchievements />
    </div>
  );
}
