"use client";
import { AchievementList } from "@/app/types/types";
import Image from "next/image";
import { useState } from "react";
import { FaX } from "react-icons/fa6";

const AchievementsList = ({
  achievements,
}: {
  achievements: AchievementList[];
}) => {
  const [info, setInfo] = useState<AchievementList | null>(null);
  return (
    <>
      {info ? (
        <div className="relative mb-2 flex w-full items-center gap-2 rounded-sm bg-base-100 p-1 text-xs md:text-sm">
          <FaX
            onClick={() => setInfo(null)}
            className="absolute -right-2 -top-2 size-4 cursor-pointer opacity-80 hover:opacity-100"
          />
          <Image src={info.image} height={50} width={50} alt={info.name} />
          <div className="flex w-full flex-col gap-1">
            <p className="text-center font-semibold">{info.name}</p>
            <p>{info.description}</p>
          </div>
          <span className="ml-auto whitespace-nowrap">ID: {info.id}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1 overflow-hidden p-px">
        {achievements.map((a, idx) => (
          <div
            onClick={() => setInfo(a)}
            onMouseOver={() => {
              info ? setInfo(a) : null;
            }}
            key={idx}
            className="cursor-pointer transition-all hover:scale-105"
          >
            <Image src={a.image} height={50} width={50} alt={a.name} />
          </div>
        ))}
      </div>
    </>
  );
};

export default AchievementsList;
