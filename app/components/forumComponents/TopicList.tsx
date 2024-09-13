import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { FaInfo } from "react-icons/fa6";
import TopicListCard from "./TopicListCard";
export const experimental_ppr = true;
type TopicListProps = {
  title: string;
  dbTarget: string;
  postCount?: number;
  postSkip?: number;
  summary: string;
  isPreview?: boolean;
};
export default async function TopicList({
  title,
  dbTarget,
  postCount,
  postSkip,
  summary,
  isPreview,
}: TopicListProps) {
  const fetchPosts = async () => {
    return await db.post.findMany({
      relationLoadStrategy: "join",
      where: {
        category: dbTarget,
      },
      select: {
        title: true,
        subTitle: true,
        createdAt: true,
        id: true,
        slug: true,
        category: true,
        status: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
        author: {
          select: {
            nickname: true,
            id: true,
          },
        },
        comments: {
          take: 1,
          select: {
            author: {
              select: {
                nickname: true,
                id: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: [
        {
          bumpDate: "desc",
        },
      ],
      take: postCount,
      skip: postSkip,
    });
  };
  const getCachedPosts = unstable_cache(
    async () => {
      return fetchPosts();
    },
    [dbTarget],
    {
      revalidate: false,
      tags: ["recent"],
    },
  );
  const Posts = async () => {
    const categoryPosts = isPreview
      ? await getCachedPosts()
      : await fetchPosts();
    return (
      <>
        {categoryPosts.length >= 1 ? (
          <>
            {categoryPosts.map((e, idx) => (
              <TopicListCard {...e} key={idx} />
            ))}
          </>
        ) : (
          <span className="my-5 text-center font-semibold opacity-80">
            Brak postów
          </span>
        )}
      </>
    );
  };

  return (
    <div className="flex w-full flex-col rounded-box border border-base-300 bg-base-200">
      <div className="flex flex-col gap-1 rounded-box p-2 md:p-4">
        <div className="flex justify-between">
          <div className="flex justify-center">
            <Link
              href={`/forum/${dbTarget}`}
              className="link-hover font-semibold"
            >
              {title}
            </Link>
            <div
              className="tooltip tooltip-right tooltip-accent"
              data-tip={summary}
            >
              <FaInfo className="size-2.5 cursor-pointer opacity-80" />
            </div>
          </div>
          <div className="hidden items-center gap-5 text-center text-xs lg:flex">
            <span className="w-20">ODPOWIEDZI</span>
            <span className="w-20">REAKCJE</span>
            <span className="w-48 text-start">OSTATNI POST</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Suspense
            key={dbTarget + postSkip + isPreview}
            fallback={ListCardSkeleton()}
          >
            <Posts />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
export const ListCardSkeleton = () => {
  const arr = [1, 2, 3];
  return (
    <>
      {arr.map((i) => (
        <div
          key={i}
          className="flex h-24 items-center gap-5 rounded-box border-b-2 border-base-100 p-2 md:p-4"
        >
          <div className="skeleton size-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="skeleton h-3 w-32"></div>
            <div className="skeleton h-3 w-44"></div>
            <div className="skeleton mt-1 h-2 w-52"></div>
          </div>
        </div>
      ))}
    </>
  );
};
