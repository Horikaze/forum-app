import GETHandlerImage from "@/app/components/forumComponents/GETHandlerImage";
import db from "@/lib/db";
import { ImageResponse } from "next/og";

export async function GET() {
  const post = await db.post.findFirst({
    where: {
      slug: "12121212-06-09-24",
    },
    select: {
      title: true,
      subTitle: true,
      author: {
        select: {
          nickname: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });
  if (!post) return;
  return new ImageResponse(
    (
      <GETHandlerImage
        commentsCount={post._count.comments}
        likesCount={post._count.reactions}
        nickname={post.author.nickname}
        profileImage={
          post.author.profileImage ||
          `https://ui-avatars.com/api/?name=${post.author.nickname}`
        }
        title={post.title}
        subTitle={post.subTitle || ""}
      />
    ),
    {
      width: 1200,
      height: 600,
    },
  );
}
