import { formatDatePost } from "@/app/utils/formatDate";
import { auth } from "@/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import { FaPlus, FaRegImage } from "react-icons/fa6";
import ChangeNickname from "./components/ChangeNickname";
import ChangeAvatar from "./components/ChangeAvatar";
import { testAchiv } from "@/app/constants/testing";
import ChangeSignature from "./components/ChangeSignature";
import SSRMDXRenderer from "@/app/components/SSRMDXRenderer";

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
    <div className="flex min-h-screen flex-col gap-5">
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4 lg:min-h-[300px] 2xl:min-h-[600px]">
        <div className="group relative z-20 flex flex-col">
          <ChangeSignature signature="124" />
          <div className="flex shrink-0 gap-2">
            <div className="flex flex-col gap-2">
              <div className="group/fpf relative w-32 overflow-hidden rounded-box">
                <Image
                  src={user.profileImage || "/images/placeholder.png"}
                  alt={user.nickname}
                  width="0"
                  height="0"
                  sizes="100vw"
                  className="h-auto w-full"
                />
                <ChangeAvatar />
              </div>
              <div className="grid w-32 grid-cols-4 gap-1">
                {testAchiv.slice(0, 6).map((a, idx) => (
                  <div className="tooltip" data-tip={a.description} key={idx}>
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
              <span>{user.role.toLowerCase()}</span>
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
            </div>
          </div>
          <div className="divider" />
          <div className="flex w-full flex-col">
            <SSRMDXRenderer markdown={testSig} />
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden rounded-box opacity-30">
          <Image
            src={"/files/testBanner.jpg"}
            alt="banner"
            fill
            className="object-cover"
            style={{
              objectPosition: "50% 30%",
            }}
          />
        </div>
      </div>
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Osiągnięcia</p>
        <div className="divider" />
        <div className="flex flex-wrap gap-1">
          {testAchiv.map((a, idx) => (
            <div className="tooltip" data-tip={a.description} key={idx}>
              <Image src={a.image} height={50} width={50} alt={a.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
