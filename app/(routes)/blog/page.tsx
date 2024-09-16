import BlogListCard from "@/app/components/forumComponents/BlogListCard";
import db from "@/lib/db";
import Link from "next/link";

export default async function Blog({
  searchParams,
}: {
  searchParams: { page: string | undefined };
}) {
  const pageNumber = Math.max(1, Number(searchParams.page) || 1);
  const dbTarget = "blog";
  const allPostCount = await db.post.count({
    where: {
      category: dbTarget,
    },
  });
  const postsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(allPostCount / postsPerPage));
  const fetchPosts = async () => {
    return await db.post.findMany({
      relationLoadStrategy: "join",
      where: {
        category: dbTarget,
        status: "PUBLISHED",
      },
      select: {
        title: true,
        subTitle: true,
        createdAt: true,
        id: true,
        featuredImage: true,
        slug: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: [
        {
          bumpDate: "desc",
        },
      ],
      take: postsPerPage,
      skip: (pageNumber - 1) * postsPerPage,
    });
  };
  const blogPost = await fetchPosts();
  return (
    <div className="flex grow flex-col gap-5">
      {blogPost.map((p) => (
        <BlogListCard
          key={p.id}
          title={p.title}
          href={`/${dbTarget}/` + p.slug}
          commentsCount={p._count.comments}
          reactionsCount={p._count.reactions}
          subTitle={p.subTitle!}
          featuredImage={p.featuredImage || undefined}
        />
      ))}
      <div className="join mt-auto self-center">
        {pageNumber > 1 ? (
          <Link
            href={`/${dbTarget}?page=${pageNumber - 1}`}
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
            href={`/${dbTarget}?page=${pageNumber + 1}`}
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
