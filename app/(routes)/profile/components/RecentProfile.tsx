import {
  RecentCommentComponent,
  RecentPostComponent,
  RecentReplayComponent,
} from "@/app/components/RecentItems";
import { RequestComponent } from "@/app/components/RequestComponent";
import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import {
  fetchMoreCommentsAction,
  fetchMorePostsAction,
  fetchMoreReplaysAction,
} from "../[user]/dataActions";
import LoadMore from "./LoadMore";

type RecentProfileProps = {
  userId: string;
  isMine: boolean;
};

export default async function RecentProfile({
  userId,
  isMine,
}: RecentProfileProps) {
  const take = 2;
  const getRecentPosts = unstable_cache(
    async (userId: string) => {
      return await Promise.all([
        fetchMorePostsAction(userId, take, 0),
        fetchMoreCommentsAction(userId, take, 0),
        fetchMoreReplaysAction(userId, take, 0),
        db.user.findFirst({
          where: { id: userId },
          select: {
            requests: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        }),
        db.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            _count: {
              select: {
                replay: true,
                posts: true,
                comments: true,
              },
            },
          },
        }),
      ]);
    },
    [userId + "recent"],
    {
      revalidate: 10,
      tags: [userId + "recent"],
    },
  );
  const [posts, comments, replays, requests, itemsCount] =
    await getRecentPosts(userId);
  return (
    <div className="flex flex-col">
      <div className="relative rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Posty</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {posts!.map((p, idx) => (
            <RecentPostComponent post={p} key={idx} />
          ))}
          <LoadMore
            take={take}
            dataCount={itemsCount?._count.posts || 0}
            type="RecentPost"
          />
        </div>
      </div>
      <div className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Komentarze</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {comments!.map((com, idx) => (
            <RecentCommentComponent com={com} key={idx} />
          ))}
          <LoadMore
            take={take}
            dataCount={itemsCount?._count.comments || 0}
            type={"RecentComment"}
          />
        </div>
      </div>
      <div className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Powtórki</p>
        <div className="divider" />
        <div className="flex flex-col gap-1">
          {replays!.map((rpy, idx) => (
            <RecentReplayComponent rpy={rpy} key={idx} />
          ))}
          <LoadMore
            take={take}
            dataCount={itemsCount?._count.replay || 0}
            type="RecentReplay"
          />
        </div>
      </div>
      {requests && isMine ? (
        <div
          id="req"
          className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4"
        >
          <p className="text-center text-2xl font-semibold">Zapytania</p>
          <div className="divider" />
          <div className="flex flex-col gap-1">
            {requests.requests.map((req, idx) => (
              <RequestComponent isAdmin={false} req={req} key={idx} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
