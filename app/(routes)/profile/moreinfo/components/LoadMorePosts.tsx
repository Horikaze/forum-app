"use client";

import { RecentPost } from "@/app/types/prismaTypes";
import { formatDatePost } from "@/app/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCalendar } from "react-icons/fa6";
import { fetchMorePostsAction } from "../dataActions";

export default function LoadMorePosts({
  take,
  postCount,
}: {
  take: number;
  postCount: number;
}) {
  const [posts, setPosts] = useState<RecentPost[]>([]);
  const [count, setCount] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const fetchMoreComments = async () => {
    try {
      setIsPending(true);
      const res = await fetchMorePostsAction(take, count * take);
      setPosts((p) => [...p, ...res!]);
      setCount((p) => p + 1);
    } catch (error) {
      toast.error("Błąd z serwerem");
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      {posts!.map((p, idx) => (
        <RecentPostComponent post={p} key={idx} />
      ))}
      <button
        disabled={posts.length >= postCount - take || isPending}
        className="btn btn-ghost btn-sm"
        onClick={fetchMoreComments}
      >
        {isPending ? <span className="loading loading-spinner"></span> : null}
        {posts.length >= postCount - take
          ? "Brak więcej komentarzy"
          : "Więcej..."}
      </button>
    </>
  );
}

// react is bugged as fk so we need duplicate components here
const RecentPostComponent = ({ post }: { post: RecentPost }) => {
  return (
    <Link
      href={`${post?.category === "blog" ? "" : "/forum"}/${post.category}/${post.slug}`}
      className="group relative line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
    >
      {post.featuredImage ? (
        <Image
          src={post.featuredImage}
          alt="cover"
          fill
          className="absolute object-cover opacity-60 transition-all group-hover:scale-110"
        />
      ) : null}
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
