import {
  RecentCommentComponent,
  RecentPostComponent,
  RecentReplayComponent,
} from "@/app/components/RecentItems";
import {
  fetchMoreCommentsAction,
  fetchMorePostsAction,
  fetchMoreReplaysAction,
} from "./dataActions";
import LoadMoreComments from "./components/LoadMoreComments";
import LoadMorePosts from "./components/LoadMorePosts";
import LoadMoreReplays from "./components/LoadMoreReplays";
import db from "@/lib/db";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export default async function RecentPostsPage() {
  const take = 2;
  const session = await auth();
  if (!session) redirect("/");
  const getRecentPosts = unstable_cache(
    async (userId: string) => {
      console.log(userId + "recent");
      return await Promise.all([
        fetchMorePostsAction(userId, take, 0),
        fetchMoreCommentsAction(userId, take, 0),
        fetchMoreReplaysAction(userId, take, 0),
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
    [session.user.id + "recent"],
    {
      revalidate: 10,
    },
  );
  const [posts, comments, replays, itemsCount] = await getRecentPosts(
    session.user.id,
  );
  return (
    <div className="flex flex-col">
      <div className="relative rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Posty</p>
        <div className="flex flex-col gap-1">
          {posts!.map((p, idx) => (
            <RecentPostComponent post={p} key={idx} />
          ))}
          <LoadMorePosts
            take={take}
            postCount={itemsCount?._count.posts || 0}
          />
        </div>
      </div>
      <div className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Komentarze</p>
        <div className="flex flex-col gap-1">
          {comments!.map((com, idx) => (
            <RecentCommentComponent com={com} key={idx} />
          ))}
          <LoadMoreComments
            take={take}
            commentsCount={itemsCount?._count.comments || 0}
          />
        </div>
      </div>
      <div className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4">
        <p className="text-center text-2xl font-semibold">Powtórki</p>
        <div className="flex flex-col gap-1">
          {replays!.map((rpy, idx) => (
            <RecentReplayComponent rpy={rpy} key={idx} />
          ))}
          <LoadMoreReplays
            take={take}
            replaysCount={itemsCount?._count.replay || 0}
          />
        </div>
      </div>
    </div>
  );
}
