import TopicList from "@/app/components/forumComponents/TopicList";
import { forumCategory } from "@/app/constants/forum";
import db from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaPlus } from "react-icons/fa6";

export default async function CategoryPage(
  props: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ page: string | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const category = forumCategory.find((c) => c.dbTarget === params.category);
  if (!category) notFound();
  const postsPerPage = 10;

  const pageNumber = Math.max(1, Number(searchParams.page) || 1);

  const allPostCount = await db.post.count({
    where: {
      category: category.dbTarget,
    },
  });

  const totalPages = Math.max(1, Math.ceil(allPostCount / postsPerPage));
  return (
    <div className="flex grow flex-col items-end gap-5">
      <Link
        href={`/forum/new/?forumTarget=${category.dbTarget}`}
        className="btn btn-primary"
      >
        Dodaj
        <FaPlus />
      </Link>
      <TopicList
        {...category}
        postCount={postsPerPage}
        postSkip={(pageNumber - 1) * postsPerPage}
      />
      <div className="join mt-auto self-center">
        {pageNumber > 1 ? (
          <Link
            href={`/forum/${category.dbTarget}?page=${pageNumber - 1}`}
            className="btn join-item"
          >
            «
          </Link>
        ) : (
          <button disabled className="btn join-item">
            «
          </button>
        )}
        <button className="btn join-item">Strona {pageNumber}</button>
        {pageNumber < totalPages ? (
          <Link
            href={`/forum/${category.dbTarget}?page=${pageNumber + 1}`}
            className="btn join-item"
          >
            »
          </Link>
        ) : (
          <button disabled className="btn join-item">
            »
          </button>
        )}
      </div>
    </div>
  );
}
