"use client";
import { cn } from "@/app/utils/twUtils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaInfo } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import {
  FaArrowLeft,
  FaBookOpen,
  FaHouse,
  FaPaintRoller,
  FaPen,
  FaRankingStar,
} from "react-icons/fa6";
import { MdOutlineForum } from "react-icons/md";
import { PiTestTubeBold } from "react-icons/pi";
const sideNavLinks = [
  {
    title: "Strona główna",
    href: "/",
    icon: FaHouse,
  },
  {
    title: "Użytkownicy",
    href: "/user",
    icon: FaUsers,
  },
  {
    title: "Forum",
    href: "/forum",
    icon: MdOutlineForum,
  },
  {
    title: "Rankingi",
    href: "/ranking",
    icon: FaRankingStar,
  },
  {
    title: "Poradniki",
    href: "/guides",
    icon: FaBookOpen,
  },
  {
    title: "Blog",
    href: "/mdxtestpage",
    icon: FaPen,
  },
  {
    title: "Informacje",
    href: "/info",
    icon: FaInfo,
  },
  {
    title: "Testing",
    href: "/testing",
    icon: PiTestTubeBold,
  },
];
const themes = [
  "black",
  "dark",
  "dim",
  "retro",
  "valentine",
  "cupcake",
  "light",
];
export default function NavSide() {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  const openCloseNav = () => {
    setIsOpen((p) => !p);
  };

  return (
    <aside
      className={cn(
        "absolute z-30 flex h-full flex-col justify-between border-r border-base-300 bg-base-200 transition-all md:relative",
        isOpen ? "w-64" : "w-0 md:w-16",
      )}
    >
      <button
        onClick={openCloseNav}
        className="group absolute -right-16 top-0 z-30 grid size-16 cursor-pointer place-items-center"
      >
        <FaArrowLeft
          className={cn(
            "size-6 transition-all group-hover:opacity-80",
            isOpen ? "rotate-0" : "rotate-180",
          )}
        />
      </button>
      <div className="overflow-hidden">
        <Link
          href={"/"}
          className="btn btn-ghost flex h-16 w-64 items-center justify-start whitespace-nowrap rounded-none border-0 p-0 transition-all hover:bg-base-200"
        >
          <div className="size-[63px] p-2">
            <Image
              src={"/images/gensoIcon.webp"}
              priority
              alt="icon"
              width="0"
              height="0"
              sizes="100vw"
              className="h-auto w-full rounded-full"
            />
          </div>
          <span
            className={cn(
              isOpen ? "opacity-100" : "opacity-0",
              "flex-1 bg-gradient-to-r from-warning to-accent bg-clip-text text-xl tracking-wider text-transparent transition-opacity",
            )}
          >
            Gensokyawka
          </span>
        </Link>
        <div>
          {sideNavLinks.map((l, idx) => {
            let current;
            if (pathname === "/") {
              current = l.href === "/";
            } else {
              current = l.href !== "/" && pathname.startsWith(l.href);
            }
            return (
              <Link
                key={idx}
                href={l.href}
                className={cn(
                  "btn btn-ghost flex w-64 items-center justify-start whitespace-nowrap rounded-none border-0 p-0 transition-all hover:bg-base-200",
                  current
                    ? "bg-base-300 hover:bg-base-300"
                    : "opacity-80 hover:text-base-content",
                )}
              >
                <div className="grid w-[63px] place-items-center">
                  <l.icon className={cn("size-5", current && "text-warning")} />
                </div>
                <span
                  className={cn(
                    isOpen ? "opacity-100" : "opacity-0",
                    "transition-opacity",
                  )}
                >
                  {l.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div
        className={cn(
          "dropdown dropdown-top",
          !isOpen && "overflow-hidden md:overflow-visible",
        )}
      >
        <div tabIndex={0} role="button" className="btn w-full">
          <FaPaintRoller />
          Motyw
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content z-10 w-52 gap-1 rounded-box bg-base-100 p-2 shadow"
        >
          {themes.map((theme) => (
            <div
              key={theme}
              data-theme={theme}
              data-set-theme={theme}
              className="btn rounded-sm"
            >
              {theme}
            </div>
          ))}
        </ul>
      </div>
    </aside>
  );
}
