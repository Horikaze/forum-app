import Link from "next/link";
import { FaCalendar, FaImage } from "react-icons/fa6";
import {
  RecentAchievement,
  RecentComment,
  RecentPost,
  RecentReplay,
} from "../types/prismaTypes";
import { formatDatePost } from "../utils/formatDate";
import { getCCstring } from "../utils/replayUtils";
import SSRMDXRenderer from "./SSRMDXRenderer";
import Image from "next/image";
import { cn } from "../utils/twUtils";
import { forumAchievements } from "../constants/forumAchievements";
export const RecentPostComponent = ({ post }: { post: RecentPost }) => {
  return (
    <Link
      href={`${post?.category === "blog" ? "" : "/forum"}/${post.category}/${post.slug}`}
      className={cn(
        "group relative line-clamp-2 flex min-h-20 flex-col justify-between gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100",
        post.featuredImage ? "dark:text-white" : "",
      )}
    >
      {post.featuredImage ? (
        <Image
          src={post.featuredImage}
          alt="cover"
          fill
          sizes="(max-width: 600px) 500px, 500px"
          className="absolute object-cover opacity-60 transition-all group-hover:scale-110"
        />
      ) : null}
      <span className="z-10 line-clamp-2">{post.title}</span>
      <span className="z-10 line-clamp-2 text-xs opacity-90">
        {post.subTitle}
      </span>
      <div className="z-10 mt-2 flex justify-between text-xs opacity-90">
        <p>
          Przez:{" "}
          <span className="text-black dark:text-white">
            {post.author.nickname}{" "}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(post.createdAt)}
        </div>
      </div>
    </Link>
  );
};

export const RecentCommentComponent = ({ com }: { com: RecentComment }) => {
  return (
    <Link
      href={`${com.post?.category === "blog" || com.parentComment?.post?.category === "blog" ? "" : "/forum"}/${com.post?.category || com.parentComment?.post?.category}/${com.post?.slug || com.parentComment?.post?.slug}`}
      className="line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
    >
      <div className="line-clamp-2">
        {com.content.substring(0, 10).includes("<img") ? (
          <div className="flex items-center gap-1">
            Obrazek <FaImage />
          </div>
        ) : (
          <SSRMDXRenderer markdown={com.content.substring(0, 30)} isPreview />
        )}
      </div>
      {com.post?.title ? (
        <p className="line-clamp-1 whitespace-nowrap text-xs opacity-90">
          W: {com.post?.title}
        </p>
      ) : (
        <p className="line-clamp-1 whitespace-nowrap text-xs opacity-90">
          W: {com.parentComment?.post!.title}
        </p>
      )}
      <div className="mt-2 flex justify-between text-xs opacity-80">
        <p>
          Przez:{" "}
          <span className="text-black dark:text-white">
            {com.author.nickname}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(com.createdAt)}
        </div>
      </div>
    </Link>
  );
};

export const RecentReplayComponent = ({ rpy }: { rpy: RecentReplay }) => {
  return (
    <Link
      href={`/replay/${rpy.replayId}`}
      className="line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
    >
      <p>
        Touhou: {rpy.game},{" "}
        {rpy.score.toLocaleString() +
          " " +
          rpy.character +
          " " +
          rpy.shotType +
          " " +
          getCCstring(rpy.achievement)}
      </p>
      <div className="mt-2 flex justify-between text-xs opacity-80">
        <p>
          Przez:{" "}
          <span className="text-black dark:text-white">
            {rpy.profile?.nickname}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(rpy.createdAt)}
        </div>
      </div>
    </Link>
  );
};
export const RecentAchievementsComponent = ({
  achi,
}: {
  achi: RecentAchievement;
}) => {
  const achiData = forumAchievements.find((a) => a.id === achi.achievementId);
  if (!achiData) return null;
  return (
    <Link
      href={`/profile/${achi.userId}`}
      className="line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
    >
      <div className="flex items-center gap-1">
        <Image
          src={achiData.image}
          alt={achiData.name}
          height={40}
          width={40}
        />
        <div>
          <p className="line-clamp-1 text-xs">
            {achiData.name} <span className="opacity-60 text-[0.70rem]">ID: {achiData.id}</span>
          </p>
          <p className="line-clamp-2 text-[0.70rem] text-xs opacity-80">
            {achiData.description}
          </p>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs opacity-80">
        <p>
          Przez:{" "}
          <span className="text-black dark:text-white">
            {achi.user.nickname}{" "}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(achi.createdAt)}
        </div>
      </div>
    </Link>
  );
};
