import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import db from "@/lib/db";
import GETHandlerImage from "@/app/components/forumComponents/GETHandlerImage";

// export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const post = await db.post.findFirst({
    where: {
      slug: slug || "",
    },
    select: {
      title: true,
      subTitle: true,
      featuredImage: true,
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  const { _count, featuredImage, subTitle, title } = post;

  return new ImageResponse(
    (
      <GETHandlerImage
        commentsCount={_count.comments}
        reactionsCount={_count.reactions}
        featuredImage={featuredImage!}
        subTitle={subTitle || ""}
        title={title || ""}
      />
    ),
    {
      width: 1200,
      height: 600,
    },
  );
}
