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
import TakeTableSS from "./components/TakeTableSS";

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
  const testSig = `<p className="text-center text-warning font-semibold text-xl">To jest mój opis :reisenXD:</p>
           
  Emmm nie wiem co tu napisać :sad: ,  lorem goooo...

 Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sequi accusantium corporis maiores omnis quam error! Praesentium, impedit? Tempore enim nam fugit molestias eum tenetur praesentium cupiditate nulla minus pariatur quisquam modi, suscipit est id impedit cum nobis ex qui harum! Ullam necessitatibus corrupti voluptatem dignissimos reiciendis, doloribus placeat. Aut sint quisquam tempore ex iure soluta. Distinctio minus optio nulla doloremque.

            `;
  if (!user) {
    redirect("/");
  }

  const array = Array.from({ length: 32 }, (_, i) => i + 1);
  return (
    <div className="flex min-h-screen flex-col gap-5 overflow-x-hidden">
      <div
        className={cn(
          "relative flex rounded-box bg-base-300 p-2",
          user.bannerImage ? "lg:min-h-[300px] lg:p-4 2xl:min-h-[600px]" : "",
        )}
      >
        <div className="group relative z-10 flex flex-1 flex-col">
          <ChangeDescription description="124" />
          <ChangeImage aspect={2.5} target="bannerImage">
            <span className="absolute right-6 top-0 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-80">
              <FaImage />
            </span>
          </ChangeImage>
          <div className="flex shrink-0 gap-2">
            <div className="flex flex-col">
              <div className="group/fpf relative size-32 overflow-hidden rounded-box">
                <Image
                  src={user.profileImage || "/images/placeholder.png"}
                  alt={user.nickname}
                  width="0"
                  height="0"
                  loading="lazy"
                  sizes="100vw"
                  className="h-auto w-full"
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
          <div className="mt-auto">
            {user.description ? (
              <>
                <div className="divider" />
                <div className="flex max-h-72 w-full flex-col overflow-hidden rounded-sm bg-base-200/40 p-2">
                  <SSRMDXRenderer markdown={user.description} />
                </div>
              </>
            ) : null}
          </div>
        </div>
        {user.bannerImage ? (
          <div className="absolute inset-0 overflow-hidden rounded-box opacity-40">
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
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Osiągnięcia</p>
        <div className="divider" />
        <div className="flex flex-wrap gap-1">
          <AchievementsList achievements={testAchiv} />
        </div>
      </div>
      <div className="group relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <TakeTableSS />
        <p className="text-center text-2xl font-semibold">
          Osiągniecia w grach
        </p>
        <div className="divider" />
        <CCTable table={user.table!} />
      </div>
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Dodaj powtórkę</p>
        <div className="divider" />
        <AddReplay />
      </div>
    </div>
  );
}
