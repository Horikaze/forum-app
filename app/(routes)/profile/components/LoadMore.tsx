"use client";

import MDXRenderer from "@/app/components/MDXRenderer";
import {
  RecentComment,
  RecentPost,
  RecentReplay,
} from "@/app/types/prismaTypes";
import { formatDatePost } from "@/app/utils/formatDate";
import { getCCstring } from "@/app/utils/replayUtils";
import { cn } from "@/app/utils/twUtils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCalendar, FaImage } from "react-icons/fa6";
import {
  fetchMoreCommentsAction,
  fetchMorePostsAction,
  fetchMoreReplaysAction,
} from "../[user]/dataActions";

export default function LoadMore({
  take,
  dataCount,
  type,
}: {
  take: number;
  dataCount: number;
  type: "RecentComment" | "RecentReplay" | "RecentPost";
}) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();

  const fetchMorePost = async () => {
    try {
      setIsPending(true);
      const fetchAction = () => {
        switch (type) {
          case "RecentPost":
            return fetchMorePostsAction;
          case "RecentComment":
            return fetchMoreCommentsAction;
          case "RecentReplay":
            return fetchMoreReplaysAction;
          default:
            throw new Error("Invalid type");
        }
      };
      const res = await fetchAction()(session?.user.id!, take, count * take);
      if (res) {
        setData((prev) => [...prev, ...res]);
        setCount((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Błąd z serwerem");
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      {data!.map((e, idx) => {
        console.log(e);
        if (type === "RecentComment") {
          return <RecentCommentComponent com={e} key={idx} />;
        } else if (type === "RecentPost") {
          return <RecentPostComponent post={e} key={idx} />;
        } else {
          return <RecentReplayComponent rpy={e} key={idx} />;
        }
      })}
      <button
        disabled={data.length >= dataCount - take || isPending}
        className="btn btn-ghost btn-sm disabled:btn-ghost"
        onClick={fetchMorePost}
      >
        {isPending ? <span className="loading loading-spinner"></span> : null}
        {data.length >= dataCount - take ? "Brak więcej wyników" : "Więcej..."}
      </button>
    </>
  );
}

// react is bugged as fk so we need duplicate components here
const RecentCommentComponent = ({ com }: { com: RecentComment }) => {
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
          <MDXRenderer markdown={com.content.substring(0, 30)} />
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
        <p>Przez: {com.author.nickname}</p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(com.createdAt)}
        </div>
      </div>
    </Link>
  );
};
const RecentReplayComponent = ({ rpy }: { rpy: RecentReplay }) => {
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
          <span>Przez:</span> {rpy.profile?.nickname}
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(rpy.createdAt)}
        </div>
      </div>
    </Link>
  );
};
export const RecentPostComponent = ({ post }: { post: RecentPost }) => {
  console.log("xD");
  return (
    <Link
      href={`${post?.category === "blog" ? "" : "/forum"}/${post.category}/${post.slug}`}
      className="group relative line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
    >
      <span className="z-10 line-clamp-2">{post.title}</span>
      <span className="z-10 line-clamp-2 text-xs opacity-90">
        {post.subTitle}
      </span>
      <div className="z-10 mt-2 flex justify-between text-xs opacity-90">
        <p>
          <span className="">Przez:</span> {post.author.nickname}
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(post.createdAt)}
        </div>
      </div>
    </Link>
  );
};
