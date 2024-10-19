import { cn } from "@/app/utils/twUtils";
import db from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function Ranking() {
  const res = await db.user.findMany({
    orderBy: {
      cc: "desc",
    },
    select: {
      id: true,
      profileImage: true,
      bannerImage: true,
      nickname: true,
      cc: true,
    },
  });
  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <div className="flex w-full flex-col items-center gap-5">
        <h2 className="text-2xl font-bold">Ilość 1CC</h2>
        <div className="flex w-full flex-col gap-1 overflow-auto">
          {res.map((u, idx) => (
            <UserRankinkElement user={u} idx={idx} key={idx} />
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-5">
        {/* <h2 className="text-2xl font-bold">Ilość 1CC</h2>
        <div className="flex w-full flex-col gap-1 overflow-auto">
          {res.map((u, idx) => (
            <UserRankinkElement u={u} idx={idx} key={idx} />
          ))}
        </div> */}
      </div>
    </div>
  );
}
type UserRankinkElementProps = {
  user: {
    id: string;
    profileImage: string | null;
    bannerImage: string | null;
    nickname: string;
    cc: number;
  };
  idx: number;
};
const UserRankinkElement = ({ user, idx }: UserRankinkElementProps) => {
  return (
    <Link
      href={`/profile/${user.id}`}
      key={user.id}
      className={cn(
        "relative isolate flex h-20 shrink-0 items-center gap-2 overflow-hidden rounded-box border-2 border-transparent bg-base-300 p-2 font-semibold shadow-md transition-all hover:bg-base-100",
        idx === 0 && "border-yellow-500",
        idx === 1 && "border-gray-300",
        idx === 2 && "border-amber-900",
      )}
    >
      {user.bannerImage ? (
        <Image
          src={user.bannerImage || "/images/placeholder_banner.jpg"}
          alt="banner"
          className="absolute right-0 top-0 -z-10 h-full w-4/5 object-cover opacity-80"
          width={600}
          height={240}
          style={{
            objectPosition: "0% 30%",
          }}
        />
      ) : null}
      <div className="absolute inset-0 left-0 top-0 -z-10 w-1/2 bg-gradient-to-r from-base-300 via-base-300 to-transparent" />
      <Image
        width={55}
        height={55}
        src={user.profileImage || "/images/placeholder.png"}
        alt={user.nickname}
        className="h-auto w-auto shrink-0 rounded-full"
      />
      <span>{user.nickname}</span>
      <div className="absolute right-0 top-1/2 z-10 grid size-10 -translate-x-2 -translate-y-1/2 place-items-center rounded-box bg-base-200 text-lg font-bold">
        <span>{user.cc}</span>
      </div>
    </Link>
  );
};
