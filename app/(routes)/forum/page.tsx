import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import TopicList from "./forumComponents/TopicList";
import { forumCategory } from "@/app/constants/forum";
export const dynamic = "force-dynamic";
export default async function Forum() {
  return (
    <div className="flex flex-col items-end gap-5">
      <Link href={"/forum/new"} className="btn btn-primary">
        Dodaj
        <FaPlus />
      </Link>
      {forumCategory.map((t) => (
        <TopicList {...t} key={t.title} postCount={4} />
      ))}
    </div>
  );
}
