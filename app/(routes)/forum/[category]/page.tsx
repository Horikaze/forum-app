import { forumCategory } from "@/app/constants/forum";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaPlus } from "react-icons/fa6";
import TopicList from "../forumComponents/TopicList";
import db from "@/lib/db";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page: string | undefined };
}) {
  const category = forumCategory.find((c) => c.href === params.category);
  const pageNumber = Number(searchParams.page) || 0;
  if (!category) notFound();

  const postCount = 10;
  const allPostCount = await db.post.count({
    where: {
      category: category.dbTarget,
    },
  });

  const totalPages = Math.ceil(allPostCount / postCount);

  return (
    <div className="flex flex-col items-end gap-5 size-full mb-5">
      <Link
        href={`/forum/new/?forumTarget=${category.dbTarget}`}
        className="btn btn-primary"
      >
        Dodaj
        <FaPlus />
      </Link>
      <TopicList
        {...category}
        postCount={postCount}
        postSkip={postCount * pageNumber}
      />
      <div className="join self-center mt-auto">
        {pageNumber === 0 ? (
          <button disabled className="join-item btn">
            «
          </button>
        ) : (
          <Link
            href={`/forum/${category.dbTarget.toLowerCase()}?page=${
              pageNumber - 1
            }`}
            className="join-item btn"
          >
            «
          </Link>
        )}
        <button className="join-item btn">Strona {pageNumber + 1}</button>
        {pageNumber < totalPages - 1 ? (
          <Link
            href={`/forum/${category.dbTarget.toLowerCase()}?page=${
              pageNumber + 1
            }`}
            className="join-item btn"
          >
            »
          </Link>
        ) : (
          <button disabled className="join-item btn">
            »
          </button>
        )}
      </div>
    </div>
  );
}
