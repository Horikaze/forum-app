import { cn } from "@/app/utils/twUtils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaComment, FaRegFaceSmile } from "react-icons/fa6";
import { IoChatboxEllipses } from "react-icons/io5";

type BlogListCardProps = {
  title: string;
  subTitle: string;
  isPreview?: boolean;
  href?: string;
  featuredImage?: string;
  reactionsCount?: number;
  commentsCount?: number;
};
export default function BlogListCard({
  subTitle,
  title,
  isPreview,
  href,
  featuredImage,
  commentsCount,
  reactionsCount,
}: BlogListCardProps) {
  return (
    <div
      className={cn(
        "group/img isolate overflow-hidden rounded-box",
        isPreview ? "rounded-b-none" : "cursor-pointer",
      )}
    >
      <Link
        href={href || "/"}
        className={cn(
          "relative block aspect-[3/1] w-full bg-base-200",
          isPreview ? "pointer-events-none" : "",
        )}
      >
        {reactionsCount != undefined ? (
          <div className="absolute right-2 top-2 z-20 flex items-center justify-center gap-2 rounded-md bg-base-300/60 p-1">
            <div className="flex items-center justify-center gap-1">
              <FaRegFaceSmile /> {reactionsCount}
            </div>
            <div className="flex items-center justify-center gap-1">
              <IoChatboxEllipses /> {commentsCount}
            </div>
          </div>
        ) : null}
        {!featuredImage?.startsWith("blob") ? (
          <Image
            fill
            sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
            src={featuredImage ?? "/images/placeholder_banner.jpg"}
            className={cn(
              "object-cover transition-all",
              !isPreview && "group-hover/img:scale-110",
            )}
            alt="preview"
          />
        ) : (
          <img
            src={featuredImage}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all group-hover/img:scale-110",
              !isPreview && "group-hover/img:scale-110",
            )}
            alt="preview"
          />
        )}
        <div className="relative z-20 flex size-full flex-col justify-end gap-2 p-2 text-white md:gap-4 md:p-4">
          <p className="line-clamp-2 text-xl font-semibold leading-10 md:line-clamp-3 md:text-2xl xl:text-5xl">
            {title}
          </p>
          <p className="line-clamp-2 text-sm font-semibold leading-4 opacity-80 md:text-lg xl:line-clamp-4 xl:text-2xl">
            {subTitle}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
      </Link>
    </div>
  );
}
