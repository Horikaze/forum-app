import GETHandlerImage from "@/app/components/forumComponents/GETHandlerImage";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const comments = searchParams.get("comments");
  const reactions = searchParams.get("reactions");
  const nickname = searchParams.get("nickname");
  const profileImage = searchParams.get("profileImage");
  const title = searchParams.get("title");
  const subTitle = searchParams.get("subTitle");
  return new ImageResponse(
    (
      <GETHandlerImage
        commentsCount={Number(comments) || 0}
        likesCount={Number(reactions) || 0}
        nickname={nickname || ""}
        profileImage={
          profileImage || `https://ui-avatars.com/api/?name=${nickname}`
        }
        title={title || ""}
        subTitle={subTitle || ""}
      />
    ),
    {
      width: 1200,
      height: 600,
    },
  );
}
