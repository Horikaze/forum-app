import {
  RecentCommentComponent,
  RecentPostComponent,
  RecentReplayComponent,
} from "@/app/components/RecentItems";
import { areDatesEqual, formatDatePost } from "@/app/utils/formatDate";
import db from "@/lib/db";
import { Request } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { FaCheckCircle } from "react-icons/fa";
import { FaCalendar, FaCircleXmark, FaClock } from "react-icons/fa6";
import {
  fetchMoreCommentsAction,
  fetchMorePostsAction,
  fetchMoreReplaysAction,
} from "../[user]/dataActions";
import LoadMore from "./LoadMore";

export default async function RecentProfile({ userId }: { userId: string }) {
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
      {requests ? (
        <div
          id="req"
          className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4"
        >
          <p className="text-center text-2xl font-semibold">Zapytania</p>
          <div className="divider" />
          <div className="flex flex-col gap-1">
            {requests.requests.map((req, idx) => (
              <RequestComponent req={req} key={idx} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const RequestComponent = ({ req }: { req: Request }) => {
  const icons: { [key: string]: JSX.Element } = {
    pending: <FaClock className="size-6" />,
    approved: <FaCheckCircle className="size-6 text-success" />,
    rejected: <FaCircleXmark className="size-6 text-warning" />,
  };

  return (
    <div className="line-clamp-2 flex cursor-pointer items-center justify-between gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100">
      <div>
        <div className="line-clamp-2">{req.message}</div>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <FaCalendar /> {formatDatePost(req.createdAt)}
          {!areDatesEqual(req.createdAt, req.updatedAt) ? (
            <span className="text-xs opacity-60">
              (Zaaktulizowano: {formatDatePost(req.updatedAt)})
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 font-semibold">
        {req.status}
        {icons[req.status] || <FaCheckCircle />}
      </div>
    </div>
  );
};
