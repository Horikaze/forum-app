import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";
import { FaCalendar } from "react-icons/fa6";
import { formatDatePost } from "../utils/formatDate";
import SSRMDXRenderer from "./SSRMDXRenderer";
import { unstable_cache } from "next/cache";
import { getCCstring } from "../utils/replayUtils";
export const experimental_ppr = true;

export default function RecentPanel() {
  return (
    <aside className="sticky top-0 hidden w-[400px] shrink-0 flex-col items-start gap-5 overflow-auto xl:flex">
      <Suspense fallback={<LoadingSkeleton />}>
        <RecentPosts />
        <RecentComments />
        <RecentReplays />
      </Suspense>
    </aside>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, index) => (
        <div key={index} className="skeleton h-96 w-full rounded-md" />
      ))}
    </>
  );
}

const getRecentPosts = unstable_cache(
  async () => {
    console.log("cache post");
    return await db.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        author: { select: { nickname: true } },
        category: true,
        slug: true,
        subTitle: true,
        title: true,
        createdAt: true,
      },
      take: 3,
    });
  },
  ["recentPosts"],
  {
    revalidate: false,
    tags: ["recent"],
  },
);
const RecentPosts = async () => {
  const posts = await getRecentPosts();
  return (
    <div className="flex w-full flex-col rounded-box bg-base-200 p-4">
      <h2 className="mb-2 text-xl font-bold">Ostatnie posty</h2>
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/forum/${post.category}/${post.slug}`}
          className="line-clamp-2 flex flex-col gap-px rounded-md bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
        >
          <span className="line-clamp-2 font-semibold">{post.title}</span>
          <span className="line-clamp-2 text-xs opacity-80">
            {post.subTitle}
          </span>
          <div className="mt-2 flex justify-between text-xs opacity-80">
            <p>
              <span className="font-semibold">Przez:</span>{" "}
              {post.author.nickname}
            </p>
            <div className="flex items-center gap-1">
              <FaCalendar /> {formatDatePost(post.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const getRecentComments = unstable_cache(
  async () => {
    console.log("cache com");
    return await db.postComment.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        author: { select: { nickname: true } },
        content: true,
        id: true,
        createdAt: true,
        post: {
          select: {
            slug: true,
            category: true,
          },
        },
        parentComment: {
          select: {
            post: {
              select: {
                slug: true,
                category: true,
              },
            },
          },
        },
      },
      take: 3,
    });
  },
  ["recentComments"],
  {
    revalidate: false,
    tags: ["recent"],
  },
);
const RecentComments = async () => {
  const recentComments = await getRecentComments();
  return (
    <div className="flex w-full flex-col rounded-box bg-base-200 p-4">
      <h2 className="mb-2 text-xl font-bold">Ostatnie komentarze</h2>
      {recentComments.map((com) => (
        <Link
          key={com.id}
          href={`/forum/${com.post?.category || com.parentComment?.post?.category}/${com.post?.slug || com.parentComment?.post?.slug}`}
          className="line-clamp-2 flex flex-col gap-px rounded-md bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
        >
          <div className="line-clamp-2">
            <SSRMDXRenderer markdown={com.content.substring(0, 30)} isPreview />
          </div>
          <div className="mt-2 flex justify-between text-xs opacity-80">
            <p>
              <span className="font-semibold">Przez:</span>{" "}
              {com.author.nickname}
            </p>
            <div className="flex items-center gap-1">
              <FaCalendar /> {formatDatePost(com.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
const getRecentReplays = unstable_cache(
  async () => {
    console.log("cache replay");
    return await db.replay.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        character: true,
        shotType: true,
        score: true,
        game: true,
        replayId: true,
        achievement: true,
        createdAt: true,
        profile: {
          select: {
            nickname: true,
          },
        },
      },
      take: 3,
    });
  },
  ["recentReplays"],
  {
    revalidate: false,
    tags: ["recent"],
  },
);
const RecentReplays = async () => {
  const recentReplays = await getRecentReplays();
  return (
    <div className="flex w-full flex-col rounded-box bg-base-200 p-4">
      <h2 className="mb-2 text-xl font-bold">Ostatnie Powtórki</h2>
      {recentReplays.map((rpy) => (
        <Link
          key={rpy.replayId}
          href={`/replay/${rpy.replayId}`}
          className="line-clamp-2 flex flex-col gap-px rounded-md bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
        >
          <p>
            Touhou: {rpy.game}, {rpy.score.toLocaleString()},{" "}
            {rpy.character + rpy.shotType + " " + getCCstring(rpy.achievement)}
          </p>
          <div className="mt-2 flex justify-between text-xs opacity-80">
            <p>
              <span className="font-semibold">Przez:</span>{" "}
              {rpy.profile?.nickname}
            </p>
            <div className="flex items-center gap-1">
              <FaCalendar /> {formatDatePost(rpy.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
