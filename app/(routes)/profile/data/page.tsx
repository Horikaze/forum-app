import {
  RecentCommentComponent,
  RecentPostComponent,
  RecentReplayComponent,
} from "@/app/components/RecentPanel";
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";

export default async function UserData() {
  const session = await auth();
  if (!session) redirect("/");
  const userData = await db.user.findFirst({
    relationLoadStrategy: "join",
    where: {
      id: session?.user.id,
    },
    take: 5,
    select: {
      comments: {
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
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      replay: {
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
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      posts: {
        select: {
          author: { select: { nickname: true } },
          category: true,
          slug: true,
          subTitle: true,
          title: true,
          featuredImage: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });
  return (
    <div className="flex flex-col gap-5">
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Posty</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {userData?.posts.map((post, idx) => (
            <RecentPostComponent post={post} key={idx} />
          ))}
        </div>
      </div>
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Komentarze</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {userData?.comments.map((com) => (
            <RecentCommentComponent com={com} key={com.id} />
          ))}
        </div>
      </div>
      <div className="relative min-h-32 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Powtórki</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {userData?.replay.map((rpy) => (
            <RecentReplayComponent rpy={rpy} key={rpy.replayId} />
          ))}
        </div>
      </div>
    </div>
  );
}
