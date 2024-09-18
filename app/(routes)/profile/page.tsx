import SSRMDXRenderer from "@/app/components/SSRMDXRenderer";
import { testAchiv } from "@/app/constants/testing";
import { formatDatePost } from "@/app/utils/formatDate";
import { cn } from "@/app/utils/twUtils";
import { auth } from "@/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import { FaImage, FaPlus, FaRegImage } from "react-icons/fa6";
import AchievementsList from "./components/AchievementsList";
import AddReplay from "./components/AddReplay";
import CCTable from "./components/CCTable";
import ChangeDescription from "./components/ChangeDescription";
import ChangeImage from "./components/ChangeImage";
import ChangeNickname from "./components/ChangeNickname";

export default async function Profile() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    include: {
      _count: {
        select: {
          comments: true,
          posts: true,
        },
      },
      table: true,
    },
  });
  if (!user) {
    redirect("/");
  }
  return (
    <div className="flex min-h-screen w-full flex-col gap-5">
      <div
        className={cn(
          "relative flex rounded-box bg-base-300",
          user.bannerImage ? "lg:min-h-[300px] 2xl:min-h-[450px]" : "",
        )}
      >
        <div className="group relative z-10 flex flex-1 flex-col">
          <ChangeDescription description="124" />
          <ChangeImage aspect={2.5} target="bannerImage">
            <span className="absolute right-8 top-2 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-80">
              <FaImage />
            </span>
          </ChangeImage>
          <div
            className={cn(
              "flex shrink-0 gap-1 self-start rounded-br-box p-2 lg:p-4",
              user.bannerImage ? "bg-base-200/60" : "",
            )}
          >
            <div className="flex flex-col">
              <div className="group/fpf relative size-32 overflow-hidden rounded-box">
                <Image
                  src={user.profileImage || "/images/placeholder.png"}
                  alt={user.nickname}
                  fill
                />
                <div className="absolute inset-0 flex items-center justify-center bg-base-300/50 opacity-0 backdrop-blur-sm transition-all group-hover/fpf:opacity-100">
                  <ChangeImage aspect={1} target="profileImage">
                    <FaRegImage className="size-8 cursor-pointer text-accent" />
                  </ChangeImage>
                </div>
              </div>
              <span className="mb-px text-center text-xs">
                Przypięte osiągnięcia
              </span>
              <div className="grid w-32 grid-cols-4 gap-1">
                {testAchiv.slice(0, 6).map((a, idx) => (
                  <div
                    className="tooltip tooltip-right"
                    data-tip={a.description}
                    key={idx}
                  >
                    <Image src={a.image} height={32} width={32} alt={a.name} />
                  </div>
                ))}
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-box bg-base-200/60 hover:bg-base-100">
                  <FaPlus />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <ChangeNickname nickname={user.nickname} />
              <span className="font-semibold">{user.role}</span>
              <span className="text-xs">
                <span className="opacity-80">Karma: </span>
                {user.karma}
              </span>
              <span className="text-xs">
                <span className="opacity-80">Posty / Komentarze: </span>
                {user._count.posts} / {user._count.comments}
              </span>
              <span className="text-xs">
                <span className="opacity-80">Dołączono: </span>
                {formatDatePost(user.createdAt)}
              </span>
              <span className="text-xs">
                <span className="opacity-80">Liczba CC: </span>
                {user.cc}
              </span>
            </div>
          </div>
          <div className="mt-auto p-2 lg:p-4">
            {user.description ? (
              <>
                <div className="divider" />
                <div className="flex max-h-72 w-full flex-col overflow-hidden rounded-sm bg-base-200/60 p-2">
                  <SSRMDXRenderer markdown={user.description} />
                </div>
              </>
            ) : null}
          </div>
        </div>
        {user.bannerImage ? (
          <div className="absolute inset-0 overflow-hidden rounded-box">
            <Image
              src={user.bannerImage}
              alt="banner"
              fill
              className="object-cover"
              style={{
                objectPosition: "70% 0%",
              }}
            />
          </div>
        ) : null}
      </div>
      <AchievementsList achievements={testAchiv} />
      <CCTable table={user.table!} />
      <AddReplay />
    </div>
  );
}
