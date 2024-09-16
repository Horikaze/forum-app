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
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Osiągnięcia</p>
        <div className="divider" />
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(50px,1fr))] justify-items-center gap-1">
          {achievements.map((a, idx) => (
            <div
              key={idx}
              onClick={() => setInfo(a)}
              onMouseOver={() => {
                if (info) setInfo(a);
              }}
              className="h-[50px] w-[50px] cursor-pointer transition-all hover:scale-105"
            >
              <Image
                src={a.image}
                layout="responsive"
                width={50}
                height={50}
                alt={a.name}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AchievementsList;
