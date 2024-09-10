import { useSession } from "next-auth/react";
import { PostDataProps } from "../types/prismaTypes";
import PostCard from "./forumComponents/PostCard";
import MDXRenderer from "./MDXRenderer";
const date = new Date();
export default function PreviewPost({ markdown }: { markdown: string }) {
  const { data: session } = useSession();
  const post: PostDataProps = {
    id: "1",
    content: markdown,
    createdAt: date,
    updatedAt: date,
    reactions: [],
    author: {
      id: "",
      nickname: session?.user.name || "Cirno",
      profileImage: session?.user.image || "/images/placeholder.png",
      role: "USER",
      createdAt: date,
      karma: 999,
      _count: {
        posts: 9,
      },
    },
  };
  return (
    <PostCard
      post={post}
      renderer={MDXRenderer}
      hideReply={true}
      hideReactions={true}
    />
  );
}
