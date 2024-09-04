"use server";
import { segregateReactionsByType } from "@/app/components/forumComponents/PostCard";
import { forumCategory } from "@/app/constants/forum";
import { getFormattedDate } from "@/app/utils/formatDate";
import db from "@/lib/db";
import { getUserSessionCreate } from "@/lib/globalActions";
import { ForumsCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import * as z from "zod";
const categories = forumCategory.map((topic) => topic.dbTarget) as [
  string,
  ...string[],
];
const newPostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Tytuł musi miec co najmniej 3 znaki." })
    .max(130, { message: "Tytuł nie może mieć więcej niż 130 znaków." }),
  subTitle: z
    .string()
    .max(130, { message: "Opis nie może mieć więcej niż 130 znaków." }),
  content: z
    .string()
    .min(10, { message: "Zawartość musi mieć co najmniej 10 znaków" }),
  category: z.enum(categories),
});
export const newPostAction = async (prevState: any, formData: FormData) => {
  let category = "";
  let title = "";
  let subTitle = "";
  let content = "";
  let slugUrl = "";
  let errorOccurred = false;
  try {
    const session = await getUserSessionCreate();
    const formDataEntries = Object.fromEntries(formData.entries());
    category = formDataEntries.category as string;
    title = formDataEntries.title as string;
    subTitle = formDataEntries.subTitle as string;
    content = formDataEntries.content as string;
    for (const [key, value] of Object.entries(formDataEntries)) {
      if (value === "on") {
        category = key;
        break;
      }
    }
    const newPostObject = {
      title,
      subTitle,
      category,
      content,
    };
    const result = newPostSchema.safeParse(newPostObject);
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      errorOccurred = true;
      throw new Error(errorMessage);
    }
    let slug = slugify(title, {
      lower: true,
      remove: /[^a-zA-Z0-9\s-]/g,
      replacement: "-",
    });
    slug += "-" + getFormattedDate();
    slugUrl = `/forum/${category.toLowerCase()}/${slug}`;
    await db.post.create({
      data: {
        title,
        subTitle,
        slug,
        content,
        status: "PUBLISHED",
        category: category as ForumsCategory,
        authorId: session.user.id,
        tags: [],
      },
    });
  } catch (error) {
    errorOccurred = true;
    if (error instanceof Error) {
      return {
        prevState: {
          title,
          subTitle,
          category,
          content,
        },
        success: false,
        message: `${error.message || error}`,
      };
    }
  } finally {
    if (!errorOccurred) {
      redirect(slugUrl);
    }
  }
};

const addCommentSchema = z.object({
  comment: z
    .string()
    .min(2, { message: "Komentarz musi miec co najmniej 2 znaki." }),
});

export const addCommentAction = async (
  comment: string,
  postId: string,
  currentUrl: string,
  isReplay: boolean,
) => {
  try {
    const session = await getUserSessionCreate();

    const newComment = {
      comment,
    };

    const result = addCommentSchema.safeParse(newComment);
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }

    if (isReplay) {
      await db.postComment.create({
        data: {
          parentCommentId: postId,
          content: comment,
          authorId: session.user.id,
        },
      });
    } else {
      await db.$transaction(async (tx) => {
        await tx.postComment.create({
          data: {
            postId: postId,
            content: comment,
            authorId: session.user.id,
          },
        });
        await tx.post.update({
          where: {
            id: postId,
          },
          data: {
            updatedAt: new Date(),
          },
        });
      });
    }

    revalidatePath(currentUrl, "page");
    return {
      success: true,
      message: "ok",
    };
  } catch (error) {
    if (error instanceof Error) {
      error = `${error.message}`;
    }
    return {
      success: false,
      message: `${error}`,
    };
  }
};

const getPostReactionmCount = async (isPost: boolean, targetId: string) => {
  if (isPost) {
    const res = await db.post.findFirst({
      relationLoadStrategy: "join",
      where: {
        id: targetId,
      },
      select: {
        reactions: {
          include: {
            user: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });
    return segregateReactionsByType(res?.reactions!, isPost);
  }
  const res = await db.postComment.findFirst({
    relationLoadStrategy: "join",
    where: {
      id: targetId,
    },
    select: {
      reactions: {
        include: {
          user: {
            select: {
              nickname: true,
            },
          },
        },
      },
    },
  });
  return segregateReactionsByType(res?.reactions!, isPost);
};

export const addReactionAction = async (
  reactionType: string,
  targetId: string,
  isPost: boolean,
) => {
  try {
    const session = await getUserSessionCreate();
    const userReaction = await db.reaction.findFirst({
      where: {
        [isPost ? "postId" : "commentId"]: targetId,
        userId: session.user.id,
      },
    });
    if (!userReaction) {
      await db.reaction.create({
        data: {
          [isPost ? "postId" : "commentId"]: targetId,
          userId: session.user.id,
          type: reactionType,
        },
      });
      return {
        success: true,
        message: "Reaction added successfully.",
        reactions: await getPostReactionmCount(isPost, targetId),
      };
    }
    if (reactionType === userReaction.type) {
      await db.reaction.delete({
        where: {
          id: userReaction.id,
        },
      });
      return {
        success: true,
        message: "Reaction updated successfully.",
        reactions: await getPostReactionmCount(isPost, targetId),
      };
    }
    await db.reaction.update({
      where: {
        id: userReaction.id,
      },
      data: {
        type: reactionType,
      },
    });

    return {
      success: true,
      message: "Reaction added successfully.",
      reactions: await getPostReactionmCount(isPost, targetId),
    };
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      message: errorMessage,
      reactions: await getPostReactionmCount(isPost, targetId),
    };
  }
};
