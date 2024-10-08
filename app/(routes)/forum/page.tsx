import TopicList from "@/app/components/forumComponents/TopicList";
import { userForumDb } from "@/app/constants/forum";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
export default async function Forum() {
  return (
    <div className="flex flex-col items-end gap-5">
      {/* <form
        action={async () => {
          "use server";
          revalidatePath("/forum");
        }}
      >
        <button className="btn">Revaalidate</button>
      </form> */}
      <Link href={"/forum/new"} className="btn btn-primary">
        Dodaj
        <FaPlus />
      </Link>
      {userForumDb.map((t) => (
        <TopicList {...t} key={t.title} postCount={4} isPreview={true} />
      ))}
    </div>
  );
}
