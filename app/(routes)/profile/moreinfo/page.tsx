import {
  RecentCommentComponent,
  RecentPostComponent,
  RecentReplayComponent,
} from "@/app/components/RecentItems";
import {
  fetchMoreCommentsAction,
  fetchMorePostsAction,
  fetchMorReplaysAction,
} from "./dataActions";
import LoadMoreComments from "./components/LoadMoreComments";
import LoadMorePosts from "./components/LoadMorePosts";
import LoadMoreReplays from "./components/LoadMoreReplays";
import db from "@/lib/db";
import { auth } from "@/auth";

export default async function RecentPostsPage() {
  const take = 2;
  const posts = await fetchMorePostsAction(take, 0);
  const commenst = await fetchMoreCommentsAction(take, 0);
  const replays = await fetchMorReplaysAction(take, 0);
  const session = await auth();
  const itemsCount = await db.user.findFirst({
    where: {
      id: session?.user.id,
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
  });
  return (
    <div className="flex flex-col">
      <div className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4">
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
          {commenst!.map((com, idx) => (
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
