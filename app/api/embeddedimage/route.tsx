import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import db from "@/lib/db";

export const runtime = "edge";

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
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: 60, margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 30, margin: 10 }}>{subTitle}</p>
          <div
            style={{
              fontSize: 20,
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span>Comments: {_count.comments}</span>
            <span>Reactions: {_count.reactions}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    },
  );
}
