import db from "@/lib/db";
import { User } from "@prisma/client";
import Link from "next/link";

export default async function CategoryPage({
  searchParams,
}: {
  searchParams: { page: string | undefined };
}) {
  const pageNumber = Math.max(1, Number(searchParams.page) || 1);
  const userPerPage = 7;

  const allUserCount = await db.user.count();
  const users = await db.user.findMany({
    take: userPerPage,
    skip: (pageNumber - 1) * userPerPage,
  });
  console.log(users.length);
  const totalPages = Math.max(1, Math.ceil(allUserCount / userPerPage));
  return (
    <div className="mb-5 flex flex-col items-end gap-5">
      {users.map((u) => (
        <UserCardList user={u} key={u.id} />
      ))}
      <div className="join mt-auto self-center">
        {pageNumber > 1 ? (
          <Link
            scroll={false}
            href={`/user?page=${pageNumber - 1}`}
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
            scroll={false}
            href={`/user?page=${pageNumber + 1}`}
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

const UserCardList = ({ user }: { user: User }) => {
  return <div className="h-32 w-full">{user.nickname}</div>;
};
