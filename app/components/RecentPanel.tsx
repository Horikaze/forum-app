import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import {
  RecentAchievementsComponent,
  RecentCommentComponent,
  RecentPostComponent,
  RecentReplayComponent,
} from "./RecentItems";
import RecentPanelController from "./RecentPanelController";

export default function RecentPanel() {
  return (
    <RecentPanelController>
      <div className="flex w-[406] flex-col gap-5 font-semibold">
        <Suspense fallback={<LoadingSkeleton />}>
          <RecentPosts />
          <RecentComments />
          <RecentAchievements />
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
        <RecentPostComponent post={post} key={post.slug} />
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
                title: true,
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
        <RecentCommentComponent com={com} key={com.id} />
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
        <RecentReplayComponent rpy={rpy} key={rpy.replayId} />
      ))}
    </div>
  );
};
const getRecentAchievements = unstable_cache(
  async () => {
    console.log("cache achievements");
    return await db.achievement.findMany({
      relationLoadStrategy: "join",
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            nickname: true,
            profileImage: true,
          },
        },
      },
      take: 3,
    });
  },
  ["recentAchievements"],
  {
    revalidate: false,
    tags: ["recent"],
  },
);
const RecentAchievements = async () => {
  const recentAchievements = await getRecentAchievements();
  return (
    <div className="flex w-full flex-col rounded-box bg-base-200 p-4">
      <h2 className="mb-2 text-xl font-bold">Ostatnie Osiągnięcia</h2>
      {recentAchievements.map((achi, idx) => (
        <RecentAchievementsComponent achi={achi} key={idx} />
      ))}
    </div>
  );
};
