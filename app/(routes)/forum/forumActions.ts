"use server";
import { segregateReactionsByType } from "@/app/components/forumComponents/PostCard";
import { getFormattedDate } from "@/app/utils/formatDate";
import db from "@/lib/db";
import { getUserSessionCreate } from "@/lib/globalActions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import * as z from "zod";

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
  dbTarget: z.string(),
});
export const newPostAction = async (prevState: any, formData: FormData) => {
  let dbTarget = "";
  let title = "";
  let subTitle = "";
  let content = "";
  let slugUrl = "";
  let errorOccurred = false;
  try {
    const session = await getUserSessionCreate();
    const formDataEntries = Object.fromEntries(formData.entries());
    dbTarget = formDataEntries.dbTarget as string;
    title = formDataEntries.title as string;
    subTitle = formDataEntries.subTitle as string;
    content = formDataEntries.content as string;
    for (const [key, value] of Object.entries(formDataEntries)) {
      if (value === "on") {
        dbTarget = key;
        break;
      }
    }
    const newPostObject = {
      title,
      subTitle,
      dbTarget,
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
    slugUrl = `/forum/${dbTarget.toLowerCase()}/${slug}`;
    await db.post.create({
      data: {
        title,
        subTitle,
        slug,
        content,
        status: "PUBLISHED",
        category: dbTarget,
        authorId: session.user.id,
        tags: [],
      },
    });
    revalidatePath("/forum");
  } catch (error) {
    errorOccurred = true;
    if (error instanceof Error) {
      return {
        prevState: {
          title,
          subTitle,
          dbTarget,
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

const commentSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Komentarz musi miec co najmniej 2 znaki." }),
});

export const addCommentAction = async (
  content: string,
  postId: string,
  isReplay: boolean,
) => {
  try {
    const session = await getUserSessionCreate();
    const result = commentSchema.safeParse({ content });
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
          content: content,
          authorId: session.user.id,
        },
      });
    } else {
      await db.$transaction(async (tx) => {
        await tx.postComment.create({
          data: {
            postId: postId,
            content: content,
            authorId: session.user.id,
          },
        });
        const oldUpdateDate = await tx.post.findFirst({
          where: {
            id: postId,
          },
          select: {
            updatedAt: true,
          },
        });
        await tx.post.update({
          where: {
            id: postId,
          },
          data: {
            bumpDate: new Date(),
            updatedAt: oldUpdateDate?.updatedAt,
          },
        });
      });
    }
    revalidatePath("/forum");
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

const getPostReaction = async (isPost: boolean, targetId: string) => {
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
    revalidatePath("/forum");
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
    const targetUserPost = isPost
      ? await db.post.findUnique({
          where: { id: targetId },
          select: { authorId: true },
        })
      : await db.postComment.findUnique({
          where: { id: targetId },
          select: { authorId: true },
        });

    if (!targetUserPost) {
      throw new Error(`Ten ${isPost ? "post" : "komentarz"} nie istnieje`);
    }
    if (!userReaction) {
      await db.$transaction(async (tx) => {
        await tx.reaction.create({
          data: {
            [isPost ? "postId" : "commentId"]: targetId,
            userId: session.user.id,
            type: reactionType,
          },
        });
        if (targetUserPost.authorId !== session.user.id) {
          await tx.user.update({
            where: {
              id: targetUserPost.authorId,
            },
            data: {
              karma: {
                increment: 1,
              },
            },
          });
        }
      });
      return {
        success: true,
        message: "Reaction added successfully.",
        reactions: await getPostReaction(isPost, targetId),
      };
    }
    if (reactionType === userReaction.type) {
      await db.$transaction(async (tx) => {
        await db.reaction.delete({
          where: {
            id: userReaction.id,
          },
        });

        if (targetUserPost.authorId !== session.user.id) {
          await tx.user.update({
            where: {
              id: targetUserPost.authorId,
            },
            data: {
              karma: {
                decrement: 1,
              },
            },
          });
        }
      });
      return {
        success: true,
        message: "Reaction updated successfully.",
        reactions: await getPostReaction(isPost, targetId),
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
      reactions: await getPostReaction(isPost, targetId),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Nieznany błąd";
    return {
      success: false,
      message: errorMessage,
      reactions: await getPostReaction(isPost, targetId),
    };
  }
};

export const editPostAction = async (
  targetId: string,
  isPost: boolean,
  currentUrl: string,
  content: string,
) => {
  try {
    const session = await getUserSessionCreate();
    const result = commentSchema.safeParse({ content });
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }
    if (isPost) {
      await db.post.update({
        where: {
          id: targetId,
          authorId: session.user.id,
        },
        data: {
          content,
        },
      });
    } else {
      await db.postComment.update({
        where: {
          id: targetId,
          authorId: session.user.id,
        },
        data: {
          content,
        },
      });
    }
    revalidatePath(currentUrl);
    return {
      success: true,
      message: "Post/Comment updated successfully.",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Nieznany błąd";
    return {
      success: false,
      message: errorMessage,
    };
  }
};
export const deletePostAction = async (
  targetId: string,
  isPost: boolean,
  currentUrl: string,
) => {
  let isError = false;
  try {
    const session = await getUserSessionCreate();
    if (isPost) {
      await db.post.delete({
        where: {
          id: targetId,
          authorId: session.user.id,
        },
      });
    } else {
      await db.postComment.delete({
        where: {
          id: targetId,
          authorId: session.user.id,
        },
      });
    }
    if (isPost) {
      revalidatePath("/forum");
      return;
    }
    revalidatePath(currentUrl);
  } catch (error) {
    isError = true;
    console.log(error);
  } finally {
    if (!isError && isPost) {
      redirect("/forum");
    }
  }
};
