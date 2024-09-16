import GETHandlerImage from "@/app/components/forumComponents/GETHandlerImage";
import db from "@/lib/db";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

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
  if (!post) return;
  const { _count, featuredImage, subTitle, title } = post;
  console.log(featuredImage);
  const asapSemiBold = fetch(
    new URL(
      "http://fonts.gstatic.com/s/asap/v5/bSf7UzaPFkjzB9TuOPVhgw.ttf",
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());
  return new ImageResponse(
    (
      <GETHandlerImage
        commentsCount={Number(_count.comments) || 0}
        reactionsCount={Number(_count.reactions) || 0}
        featuredImage={featuredImage || "/files/testBanner.jpg"}
        title={title || ""}
        subTitle={subTitle || ""}
      />
    ),
    {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: "Asap",
          data: await asapSemiBold,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
