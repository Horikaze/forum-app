"use client";
import { PostDataProps } from "@/app/types/prismaTypes";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import MDXRenderer from "../MDXRenderer";
export default function PreviewPost({ markdown }: { markdown: string }) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  const date = new Date();
  const post: PostDataProps = {
    id: "1",
    content: markdown,
    createdAt: date,
    subTitle: "",
    featuredImage: "",
    title: "",
    updatedAt: date,
    reactions: [],
    _count: {
      comments: 9,
      reactions: 23,
    },
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
