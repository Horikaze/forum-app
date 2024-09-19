import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { FaCalendar } from "react-icons/fa6";
import { formatDatePost } from "../utils/formatDate";
import { getCCstring } from "../utils/replayUtils";
import SSRMDXRenderer from "./SSRMDXRenderer";
import RecentPanelController from "./RecentPanelController";
import Image from "next/image";
export const experimental_ppr = true;

export default function RecentPanel() {
  return (
    <RecentPanelController>
      <div className="flex w-[406] flex-col gap-5 font-semibold">
        <Suspense fallback={<LoadingSkeleton />}>
          <RecentPosts />
          <RecentComments />
          <RecentReplays />
        </Suspense>
      </div>
    </RecentPanelController>
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
      relationLoadStrategy: "join",
      orderBy: { createdAt: "desc" },
      select: {
        author: { select: { nickname: true } },
        category: true,
        slug: true,
        subTitle: true,
        title: true,
        featuredImage: true,
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
    <div className="isolate flex w-full flex-col rounded-box bg-base-200 p-4">
      <h2 className="mb-2 text-xl font-bold">Ostatnie posty</h2>
      {posts.map((post) => (
        <Link
          key={post.slug}
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
      ))}
    </div>
  );
};
const getRecentComments = unstable_cache(
  async () => {
    console.log("cache com");
    return await db.postComment.findMany({
      relationLoadStrategy: "join",
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
            title: true,
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
          href={`${com.post?.category === "blog" || com.parentComment?.post?.category === "blog" ? "" : "/forum"}/${com.post?.category || com.parentComment?.post?.category}/${com.post?.slug || com.parentComment?.post?.slug}`}
          className="line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
        >
          <div className="line-clamp-2">
            <SSRMDXRenderer markdown={com.content.substring(0, 30)} isPreview />
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
      ))}
    </div>
  );
};
const getRecentReplays = unstable_cache(
  async () => {
    console.log("cache replay");
    return await db.replay.findMany({
      relationLoadStrategy: "join",
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
// @ts-ignore fix  Do not know how to serialize a BigInt
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};
const RecentReplays = async () => {
  const recentReplays = await getRecentReplays();
  return (
    <div className="flex w-full flex-col rounded-box bg-base-200 p-4">
      <h2 className="mb-2 text-xl font-bold">Ostatnie Powtórki</h2>
      {recentReplays.map((rpy) => (
        <Link
          key={rpy.replayId}
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
      ))}
    </div>
  );
};
