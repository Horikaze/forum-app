"use server";

import { auth } from "@/auth";
import db from "@/lib/db";

export const fetchMorePostsAction = async (take: number, skip: number) => {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");
  const userId = session.user.id;
  const res = await db.user.findFirst({
    where: { id: userId },
    select: {
      posts: {
        select: {
          author: { select: { nickname: true } },
          category: true,
          slug: true,
          subTitle: true,
          title: true,
          featuredImage: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      },
    },
  });
  return res?.posts;
};

export const fetchMoreCommentsAction = async (take: number, skip: number) => {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const userId = session.user.id;

  const moreComments = await db.user.findFirst({
    where: { id: userId },
    select: {
      comments: {
        select: {
          author: { select: { nickname: true } },
          content: true,
          id: true,
          createdAt: true,
          post: {
            select: {
              slug: true,
              category: true,
              title: true,
            },
          },
          parentComment: {
            select: {
              post: {
                select: {
                  slug: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      },
    },
  });
  return moreComments?.comments || [];
};
export const fetchMorReplaysAction = async (take: number, skip: number) => {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const userId = session.user.id;

  const moreComments = await db.user.findFirst({
    where: { id: userId },
    select: {
      replay: {
        select: {
          character: true,
          shotType: true,
          score: true,
          game: true,
          replayId: true,
          achievement: true,
          createdAt: true,
          profile: {
            select: {
              nickname: true,
            },
          },
        },
        take,
        skip,
      },
    },
  });
  return moreComments?.replay || [];
};
