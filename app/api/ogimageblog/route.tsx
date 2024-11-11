import db from "@/lib/db";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import GETHandlerImage from "./GETHandlerImage";

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
  const fontOptions = await loadGoogleFont("Geist", [600, 700]);
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
      // @ts-ignore
      fonts: fontOptions,
    },
  );
}
async function loadGoogleFont(font: string, weights: number[] = [400]) {
  const weightParams = weights.join(";");
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weightParams}`;
  const css = await (await fetch(url)).text();
  const resources = Array.from(
    css.matchAll(/src: url\((.+?)\) format\('(opentype|truetype)'\)/g),
  );

  if (resources.length) {
    const fontBuffers = await Promise.all(
      resources.map(async (resource) => {
        const response = await fetch(resource[1]);
        if (response.status === 200) {
          return await response.arrayBuffer();
        }
        throw new Error("Failed to load font data for a weight");
      }),
    );
    return fontBuffers.map((data, i) => ({
      name: font,
      data,
      style: "normal",
      weight: weights[i], // Set weight as a number
    }));
  }

  throw new Error("failed to load font data");
}
