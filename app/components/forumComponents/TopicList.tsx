import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { FaInfo } from "react-icons/fa6";
import TopicListCard from "./TopicListCard";
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
        category: "touhou",
      },
      select: {
        title: true,
        subTitle: true,
        createdAt: true,
        id: true,
        slug: true,
        category: true,
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
            updatedAt: "desc",
          },
        },
      },
      orderBy: [
        {
          updatedAt: "desc",
        },
      ],
      take: postCount,
      skip: postSkip,
    });
  };
  const tag = dbTarget + "Preview";
  const getCachedPosts = unstable_cache(
    async () => {
      return fetchPosts();
    },
    [tag],
    {
      revalidate: false,
      tags: [tag],
    },
  );
  const categoryPosts = isPreview ? await getCachedPosts() : await fetchPosts();
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
            <span className="w-20">REAKCJIE</span>
            <span className="w-48 text-start">OSTATNI POST</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
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
        </div>
      </div>
    </div>
  );
}
<p className="text-center text-warning">Html tagi</p>;
