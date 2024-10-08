import SSRMDXRenderer from "@/app/components/SSRMDXRenderer";
import { testAchiv } from "@/app/constants/testing";
import { UserProfile } from "@/app/types/prismaTypes";
import { formatDatePost } from "@/app/utils/formatDate";
import { cn } from "@/app/utils/twUtils";
import Image from "next/image";
import { FaDiscord, FaImage, FaPlus, FaRegImage } from "react-icons/fa6";
import ChangeDescription from "../components/ChangeDescription";
import ChangeImage from "../components/ChangeImage";
import ChangeNickname from "../components/ChangeNickname";
import SwitchProfileData from "../components/SwitchProfileData";
type ProfileLayoutComponentProps = {
  user: UserProfile;
  isMine: boolean;
};
export default function ProfileLayoutComponent({
  user,
  isMine,
}: ProfileLayoutComponentProps) {
  return (
    <>
      <div
        className={cn(
          "relative flex flex-col rounded-box bg-base-300",
          user.bannerImage ? "min-h-52 lg:min-h-[300px] 2xl:min-h-[450px]" : "",
        )}
      >
        <div className="group relative z-10 flex h-full flex-1 flex-col">
          {isMine ? (
            <>
              <ChangeDescription description={user.description!} />
              <ChangeImage aspect={2.5} target="bannerImage">
                <span className="absolute right-8 top-2 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-80">
                  <FaImage />
                </span>
              </ChangeImage>
            </>
          ) : null}
          <div className="hidden shrink-0 items-start self-start rounded-br-box lg:flex">
            <div
              className={cn(
                "flex flex-col p-2 lg:p-4",
                user.bannerImage ? "rounded-br-box bg-base-200/60" : "",
              )}
            >
              <div className="group/fpf relative size-32 overflow-hidden rounded-box">
                <Image
                  src={user.profileImage || "/images/placeholder.png"}
                  alt={user.nickname}
                  height={150}
                  width={150}
                />
                {isMine ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-base-300/50 opacity-0 backdrop-blur-sm transition-all group-hover/fpf:opacity-100">
                    <ChangeImage aspect={1} target="profileImage">
                      <FaRegImage className="size-8 cursor-pointer text-accent" />
                    </ChangeImage>
                  </div>
                ) : null}
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
            <div
              className={cn(
                "flex flex-col rounded-br-box p-2 lg:p-4",
                user.bannerImage ? "bg-base-200/60" : "",
              )}
            >
              {isMine ? (
                <ChangeNickname nickname={user.nickname} />
              ) : (
                <span className="text-2xl font-bold">{user.nickname}</span>
              )}
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
              {user.discord ? (
                <div className="flex items-center gap-1 whitespace-nowrap text-xs">
                  <FaDiscord className="size-4" />
                  {user.discord}
                </div>
              ) : null}
            </div>
          </div>
          {user.description ? (
            <div className="mt-auto hidden p-2 lg:block lg:p-4">
              <div className="divider" />
              <div className="flex max-h-72 w-full flex-col overflow-hidden rounded-sm bg-base-200/60 p-2">
                <SSRMDXRenderer markdown={user.description} />
              </div>
            </div>
          ) : null}
        </div>
        {user.bannerImage ? (
          <div className="absolute inset-0 overflow-hidden rounded-box">
            <Image
              src={user.bannerImage}
              alt="banner"
              fill
              sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
              className="object-cover"
              style={{
                objectPosition: "70% 0%",
              }}
            />
          </div>
        ) : null}
      </div>
      <div className="group relative flex min-h-32 flex-col rounded-box bg-base-300 p-2 lg:hidden">
        {isMine ? (
          <>
            <ChangeDescription description={user.description!} />
            <ChangeImage aspect={2.5} target="bannerImage">
              <span className="absolute right-8 top-2 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-80">
                <FaImage />
              </span>
            </ChangeImage>
          </>
        ) : null}
        <div className="flex">
          <div className="flex flex-col">
            <div className="group/fpf relative size-32 overflow-hidden rounded-box">
              <Image
                src={user.profileImage || "/images/placeholder.png"}
                alt={user.nickname}
                height={150}
                width={150}
              />
              {isMine ? (
                <div className="absolute inset-0 flex items-center justify-center bg-base-300/50 opacity-0 backdrop-blur-sm transition-all group-hover/fpf:opacity-100">
                  <ChangeImage aspect={1} target="profileImage">
                    <FaRegImage className="size-8 cursor-pointer text-accent" />
                  </ChangeImage>
                </div>
              ) : null}
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
          <div className="flex flex-col rounded-br-box p-2 lg:p-4">
            {isMine ? (
              <ChangeNickname nickname={user.nickname} />
            ) : (
              <span className="text-2xl font-bold">{user.nickname}</span>
            )}
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
        {user.description ? (
          <div className="mt-auto block p-2 lg:hidden lg:p-4">
            <div className="flex max-h-72 w-full flex-col overflow-hidden">
              <SSRMDXRenderer markdown={user.description} />
            </div>
          </div>
        ) : null}
      </div>
      <SwitchProfileData  isMine={false} userId="123"/>
    </>
  );
}
