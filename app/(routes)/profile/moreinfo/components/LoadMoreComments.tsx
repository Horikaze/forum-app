"use client";

import MDXRenderer from "@/app/components/MDXRenderer";
import { RecentComment } from "@/app/types/prismaTypes";
import { formatDatePost } from "@/app/utils/formatDate";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCalendar, FaImage } from "react-icons/fa6";
import { fetchMoreCommentsAction } from "../dataActions";
import { useSession } from "next-auth/react";

export default function LoadMoreComments({
  take,
  commentsCount,
}: {
  take: number;
  commentsCount: number;
}) {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [count, setCount] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();

  const fetchMorePost = async () => {
    try {
      setIsPending(true);
      const res = await fetchMoreCommentsAction(
        session?.user.id!,
        take,
        count * take,
      );
      setComments((prev) => [...prev, ...res]);
      setCount((prev) => prev + 1);
    } catch (error) {
      toast.error("Błąd z serwerem");
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      {comments!.map((com, idx) => (
        <RecentCommentComponent com={com} key={idx} />
      ))}
      <button
        disabled={comments.length >= commentsCount - take || isPending}
        className="btn btn-ghost btn-sm disabled:btn-ghost"
        onClick={fetchMorePost}
      >
        {isPending ? <span className="loading loading-spinner"></span> : null}
        {comments.length >= commentsCount - take
          ? "Brak więcej komentarzy"
          : "Więcej..."}
      </button>
    </>
  );
}

// react is bugged as fk so we need duplicate components here
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
          <MDXRenderer markdown={com.content.substring(0, 30)} />
        )}
      </div>
      {com.post?.title ? (
        <p className="line-clamp-1 whitespace-nowrap text-xs opacity-90">
          W: {com.post?.title}
        </p>
      ) : null}
      <div className="mt-2 flex justify-between text-xs opacity-80">
        <p>Przez: {com.author.nickname}</p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(com.createdAt)}
        </div>
      </div>
    </Link>
  );
};
