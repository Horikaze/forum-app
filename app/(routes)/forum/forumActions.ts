"use server";
import { segregateReactionsByType } from "@/app/components/forumComponents/PostCard";
import { adminForumDb, forumCategory, PostStatus } from "@/app/constants/forum";
import { getFormattedDate } from "@/app/utils/formatDate";
import { deleteFile, saveFile } from "@/app/utils/testingFunctions";
import db from "@/lib/db";
import { getUserSessionCreate } from "@/lib/globalActions";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import * as z from "zod";

const posibleForumTarget = forumCategory.map((c) => c.dbTarget);

const newPostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Tytuł musi miec co najmniej 3 znaki." })
    .refine(
      (value) => value.length <= 130,
      (value) => ({
        message: `Tytuł nie może mieć więcej niż 130 znaków.(${value.length})`,
      }),
    ),
  subTitle: z.string().refine(
    (value) => value.length <= 130,
    (value) => ({
      message: `Opis nie może mieć więcej niż 130 znaków.(${value.length})`,
    }),
  ),
  content: z
    .string()
    .min(10, { message: "Zawartość musi mieć co najmniej 10 znaków" })
    .refine(
      (value) => value.length <= 5000,
      (value) => ({
        message: `Post nie może mieć więcej niż 5000 znaków.(${value.length})`,
      }),
    ),
  dbTarget: z.string().refine((value) => posibleForumTarget.includes(value), {
    message: "Nie istnieje takie forum",
  }),
  file: z
    .any()
    .refine(
      (file) => file.size <= 2000 * 1024,
      (file: any) => ({
        message: `Plik musi być mniejszy niż 2MB. (${Number(file.size / 1024).toFixed()}KB)`,
      }),
    )
    .refine((file) => file.name.endsWith(".png"), {
      message: "Dozwolone rozszerzenie to: .png",
    })
    .optional()
    .or(z.literal(null)),
});

type NewPost = {
  dbTarget: string;
  title: string;
  subTitle: string;
  content: string;
  isSketch: boolean;
};

export const newPostAction = async (
  newPost: NewPost,
  featuredImageFile?: File,
): Promise<{
  success: boolean;
  message: string;
}> => {
  let slugUrl = "";
  try {
    const { content, dbTarget, isSketch, subTitle, title } = newPost;
    const { session } = await getUserSessionCreate(
      adminForumDb.some((e) => e.dbTarget === dbTarget),
    );
    const newPostObject = {
      title,
      subTitle,
      dbTarget,
      content,
      file: featuredImageFile,
    };
    const result = newPostSchema.safeParse(newPostObject);
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }
    let featuredImage = undefined;
    if (dbTarget === "blog" && featuredImageFile) {
      featuredImage = await saveFile(featuredImageFile);
    }

    let slug = slugify(title, {
      lower: true,
      remove: /[^a-zA-Z0-9\s-]/g,
      replacement: "-",
    });
    slug += "-" + getFormattedDate();
    slugUrl = `${dbTarget === "blog" ? "" : "/forum"}/${dbTarget.toLowerCase()}/${slug}`;
    await db.post.create({
      data: {
        title,
        subTitle,
        slug,
        featuredImage: featuredImage,
        content,
        status: isSketch ? PostStatus.DRAFT : PostStatus.PUBLISHED,
        category: dbTarget,
        authorId: session.user.id,
      },
    });
    revalidateTag("recent");
    return {
      success: true,
      message: slugUrl,
    };
  } catch (error) {
    if (error instanceof Error) {
      error = error.message;
    }
    return {
      success: false,
      message: `${error}`,
    };
  }
};

const commentSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Komentarz musi miec co najmniej 2 znaki." })
    .refine(
      (value) => value.length <= 5000,
      (value) => ({
        message: `Komentarz nie może mieć więcej niż 5000 znaków.(${value.length})`,
      }),
    ),
});

export const addCommentAction = async (
  content: string,
  postId: string,
  isReplay: boolean,
) => {
  try {
    const { session } = await getUserSessionCreate();
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
    revalidateTag("recent");
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
    revalidateTag("recent");
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
    const { session } = await getUserSessionCreate();
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

const editPostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Tytuł musi miec co najmniej 3 znaki." })
    .refine(
      (value) => value.length <= 130,
      (value) => ({
        message: `Tytuł nie może mieć więcej niż 130 znaków.(${value.length})`,
      }),
    )
    .optional()
    .or(z.literal("")),
  subTitle: z
    .string()
    .refine(
      (value) => value.length <= 130,
      (value) => ({
        message: `Opis nie może mieć więcej niż 130 znaków.(${value.length})`,
      }),
    )
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(2, { message: "Zawartość musi mieć co najmniej 2 znaków" })
    .refine(
      (value) => value.length <= 5000,
      (value) => ({
        message: `Post/komentarz nie może mieć więcej niż 5000 znaków.(${value.length})`,
      }),
    )
    .optional()
    .or(z.literal("")),
  file: z
    .any()
    .refine(
      (file) => file.size <= 2000 * 1024,
      (file: any) => ({
        message: `Plik musi być mniejszy niż 2MB. (${Number(file.size / 1024).toFixed()}KB)`,
      }),
    )
    .refine((file) => file.name.endsWith(".png"), {
      message: "Dozwolone rozszerzenie to: .png",
    })
    .optional()
    .or(z.literal(null)),
});

export const editPostAction = async (
  targetId: string,
  isPost: boolean,
  currentUrl: string,
  dataToUpdate: {
    content?: string;
    title?: string;
    subTitle?: string;
  },
  featuredImageFile?: File,
) => {
  try {
    const { session } = await getUserSessionCreate();
    const result = editPostSchema.safeParse(dataToUpdate);
    console.log(dataToUpdate);
    if (!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.message + " ";
      });
      throw new Error(errorMessage);
    }
    let featuredImage = undefined;
    if (featuredImageFile) {
      await db.$transaction(async (tx) => {
        const prevImage = await tx.post.findFirst({
          where: {
            id: targetId,
          },
          select: {
            featuredImage: true,
          },
        });
        if (prevImage && prevImage.featuredImage) {
        await  deleteFile(prevImage.featuredImage);
        }
        const res = await saveFile(featuredImageFile);
        featuredImage = res;
      });
    }
    if (isPost) {
      await db.post.update({
        where: {
          id: targetId,
          authorId: session.user.id,
        },
        data: { ...dataToUpdate, featuredImage },
      });
    } else {
      await db.postComment.update({
        where: {
          id: targetId,
          authorId: session.user.id,
        },
        data: dataToUpdate,
      });
    }
    revalidatePath(currentUrl, "page");
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
    const { session } = await getUserSessionCreate();
    if (isPost) {
      await db.$transaction(async (tx) => {
        const res = await tx.post.delete({
          where: {
            id: targetId,
            authorId: session.user.id,
          },
        });
        if (res.featuredImage) {
          await deleteFile(res.featuredImage);
        }
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
      revalidateTag("recent");
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
