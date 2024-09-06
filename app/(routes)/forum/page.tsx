import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { forumCategory } from "@/app/constants/forum";
import { revalidateTag } from "next/cache";
import TopicList from "@/app/components/forumComponents/TopicList";
export default async function Forum() {
  return (
    <div className="flex flex-col items-end gap-5">
      <form
        action={async () => {
          "use server";
          revalidateTag("touhouPreview");
        }}
      >
        <button className="btn">Revaalidate</button>
      </form>
      <Link href={"/forum/new"} className="btn btn-primary">
        Dodaj
        <FaPlus />
      </Link>
      {forumCategory.map((t) => (
        <TopicList {...t} key={t.title} postCount={4} isPreview={true} />
      ))}
    </div>
  );
}
