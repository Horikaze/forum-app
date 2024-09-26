"use server";
import { segregateReactionsByType } from "@/app/components/forumComponents/PostCard";
import {
  adminForumDb,
  forumCategory,
  PostStatus,
  validFileExtensions,
} from "@/app/constants/forum";
import { PostImage } from "@/app/types/types";
import { getFormattedDate } from "@/app/utils/formatDate";
import { deleteFile, saveFile } from "@/app/utils/testingFunctions";
import { checkImages } from "@/app/utils/zod";
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
  featuredImageFile: z
    .any()
    .refine(
      (file) => file.size <= 2000 * 1024,
      (file: any) => ({
        message: `Plik musi być mniejszy niż 2MB. (${Number(file.size / 1024).toFixed()}KB)`,
      }),
    )
    .refine(
      (file: any) => {
        return validFileExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        );
      },
      {
        message: `Dozwolone rozszerzenia to: ${validFileExtensions.join(", ")}`,
      },
    )
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
  images?: PostImage[],
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const { content, dbTarget, isSketch, subTitle, title } = newPost;
    const { session } = await getUserSessionCreate(
      adminForumDb.some((e) => e.dbTarget === dbTarget),
    );
    if (images) {
      if (images.length > 10) {
        return {
          success: false,
          message: "Post może mieć maksymalnie 10 obrazów.",
        };
      }
      checkImages(images.map((i) => i.file!));
    }
    const newPostObject = {
      title,
      subTitle,
      dbTarget,
      content,
      featuredImageFile: featuredImageFile,
    };
    const result = newPostSchema.safeParse(newPostObject);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      throw new Error(errorMessage);
    }

    let slug = slugify(title, {
      lower: true,
      remove: /[^a-zA-Z0-9\s-]/g,
      replacement: "-",
    });
    slug += "-" + getFormattedDate();
    let slugUrl = "";
    slugUrl = `${dbTarget === "blog" ? "" : "/forum"}/${dbTarget.toLowerCase()}/${slug}`;

    await db.$transaction(async (tx) => {
      const newPostDb = await tx.post.create({
        data: {
          title,
          subTitle,
          slug,
          content: "",
          status: isSketch ? PostStatus.DRAFT : PostStatus.PUBLISHED,
          category: dbTarget,
          authorId: session.user.id,
        },
        select: {
          id: true,
        },
      });
      const newImages = [];
      let newContent = content;
      if (images) {
        for (const element of images) {
          if (element.file) {
            const res = await saveFile(
              element.file,
              `images/post/${newPostDb.id}`,
            );
            newContent = newContent.replace(element.url, res);
            newImages.push(res);
          }
        }
      }
      let featuredImage = undefined;
      if (dbTarget === "blog" && featuredImageFile) {
        featuredImage = await saveFile(
          featuredImageFile,
          `images/post/${newPostDb.id}`,
        );
      }

      await tx.post.update({
        where: {
          id: newPostDb.id,
        },
        data: {
          featuredImage: featuredImage,
          images: newImages.join("+") || undefined,
          content: newContent,
        },
      });
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
  isReply: boolean,
  images?: PostImage[],
) => {
  try {
    const { session } = await getUserSessionCreate();
    const result = commentSchema.safeParse({ content });
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      throw new Error(errorMessage);
    }

    await db.$transaction(async (tx) => {
      let newPostId: string;
      let mainPost = "";
      if (isReply) {
        const newPostDb = await tx.postComment.create({
          data: {
            parentCommentId: postId,
            content: "",
            authorId: session.user.id,
          },
          select: {
            id: true,
            parentComment: {
              select: {
                post: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });
        mainPost = newPostDb.parentComment?.post?.id!;
        newPostId = newPostDb.id;
      } else {
        const newPostDb = await tx.postComment.create({
          data: {
            postId,
            content: "",
            authorId: session.user.id,
          },
          select: {
            id: true,
          },
        });
        newPostId = newPostDb.id;

        const post = await tx.post.findUnique({
          where: { id: postId },
          select: { updatedAt: true },
        });

        if (!post) {
          throw new Error(`Post with id ${postId} not found`);
        }

        await tx.post.update({
          where: { id: postId },
          data: {
            bumpDate: new Date(),
            updatedAt: post.updatedAt,
          },
        });
      }

      let newImages: string[] = [];
      let newContent = content;

      if (images && images.length > 0) {
        for (const element of images) {
          if (element.file) {
            const res = await saveFile(
              element.file,
              `images/post/${isReply ? mainPost : postId}`,
            );
            console.log(res);
            newImages.push(res);
            newContent = newContent.replace(element.url, res);
          }
        }
      }

      await tx.postComment.update({
        where: { id: newPostId },
        data: {
          content: newContent,
          images: newImages.length > 0 ? newImages.join("+") : undefined,
        },
      });
    });
    revalidateTag("recent");
    return {
      success: true,
      message: "Dodano komentarz!",
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
    .optional(),
  subTitle: z
    .string()
    .refine(
      (value) => value.length <= 130,
      (value) => ({
        message: `Opis nie może mieć więcej niż 130 znaków.(${value.length})`,
      }),
    )
    .optional(),
  content: z
    .string()
    .min(2, { message: "Zawartość musi mieć co najmniej 2 znaków" })
    .refine(
      (value) => value.length <= 5000,
      (value) => ({
        message: `Post/komentarz nie może mieć więcej niż 5000 znaków.(${value.length})`,
      }),
    )
    .optional(),
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
    .or(z.literal(undefined)),
});

type editPostActionProps = {
  targetId: string;
  isPost: boolean;
  currentUrl: string;
  dataToUpdate: {
    content?: string;
    title?: string;
    subTitle?: string;
  };
  images: PostImage[];
  featuredImageFile?: File;
};

export const editPostAction = async ({
  currentUrl,
  dataToUpdate,
  isPost,
  targetId,
  featuredImageFile,
  images,
}: editPostActionProps) => {
  try {
    const { session } = await getUserSessionCreate();
    if (images) {
      if (images.length > 10) {
        throw new Error("Post może mieć maksymalnie 10 obrazów.");
      }
      checkImages(images.map((i) => i.file!));
    }
    const result = editPostSchema.safeParse({
      ...dataToUpdate,
      file: featuredImageFile,
    });

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      throw new Error(errorMessage);
    }
    await db.$transaction(async (tx) => {
      let mainPostId: string;
      const newImages = images?.map((i) => i.url) || [];

      let updateResult: { id: string; images: string | null };

      if (isPost) {
        updateResult = await tx.post.update({
          where: { id: targetId, authorId: session.user.id },
          data: { ...dataToUpdate },
          select: { id: true, images: true },
        });
        mainPostId = updateResult.id;
      } else {
        const res = await tx.postComment.update({
          where: { id: targetId, authorId: session.user.id },
          data: dataToUpdate,
          select: {
            parentComment: {
              select: {
                post: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            images: true,
            post: { select: { id: true } },
          },
        });
        mainPostId = res.post?.id || res.parentComment?.post?.id!;
        updateResult = { id: targetId, images: res.images };
      }

      const currentImages = updateResult.images?.split("+") || [];
      const finalImages: PostImage[] = [];
      let newContent = dataToUpdate.content;
      // Delete images no longer needed
      for (const currImage of currentImages) {
        if (!newImages.includes(currImage) && currImage !== "") {
          await deleteFile(currImage);
        }
      }

      for (const newImage of images) {
        if (!currentImages.includes(newImage.url)) {
          const res = await saveFile(
            newImage.file!,
            `images/post/${mainPostId}`,
          );
          finalImages.push({
            url: res,
            file: newImage.file,
          });
          newContent = newContent?.replace(newImage.url, res);
        } else {
          finalImages.push(newImage);
        }
      }
      const updateData = {
        images: finalImages.map((e) => e.url).join("+"),
        content: newContent,
      };
      if (isPost) {
        let featuredImage: string | undefined;

        if (featuredImageFile) {
          const prevImage = await tx.post.findFirst({
            where: { id: targetId },
            select: { featuredImage: true },
          });

          if (prevImage?.featuredImage) {
            await deleteFile(prevImage.featuredImage);
          }

          featuredImage = await saveFile(
            featuredImageFile,
            `images/post/${targetId}`,
          );
        }
        await tx.post.update({
          where: { id: targetId },
          data: { ...updateData, content: newContent, featuredImage },
        });
      } else {
        await tx.postComment.update({
          where: { id: targetId },
          data: { ...updateData, content: newContent },
        });
      }
    });
    if (isPost) {
      revalidateTag("recent");
    } else {
      revalidatePath(currentUrl, "page");
    }
    return { success: true, message: "Zaaktulizowano" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
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
    await db.$transaction(async (tx) => {
      const imagesToDelete: string[] = [];
      if (isPost) {
        const res = await tx.post.delete({
          where: {
            id: targetId,
            authorId: session.user.id,
          },
          select: {
            images: true,
            featuredImage: true,
            comments: {
              select: {
                images: true,
                replies: {
                  select: { images: true },
                },
              },
            },
          },
        });

        // Ensure the values are strings before calling split
        if (res.featuredImage) {
          await deleteFile(res.featuredImage);
        }

        if (res.images) {
          imagesToDelete.push(...res.images.split("+"));
        }

        res.comments.forEach((comment) => {
          if (comment.images) {
            imagesToDelete.push(...comment.images.split("+"));
          }
          comment.replies.forEach((reply) => {
            if (reply.images) {
              imagesToDelete.push(...reply.images.split("+"));
            }
          });
        });
      } else {
        const res = await tx.postComment.delete({
          where: {
            id: targetId,
            authorId: session.user.id,
          },
          select: {
            images: true,
            replies: {
              select: {
                images: true,
              },
            },
          },
        });

        if (res.images) {
          imagesToDelete.push(...res.images.split("+"));
        }

        res.replies?.forEach((reply) => {
          if (reply.images) {
            imagesToDelete.push(...reply.images.split("+"));
          }
        });
      }

      console.log(imagesToDelete);
      for (const element of imagesToDelete) {
        if (element !== "") {
          await deleteFile(element);
        }
      }
    });

    revalidateTag("recent");
  } catch (error) {
    isError = true;
    console.log(error);
  } finally {
    if (!isError && isPost) {
      redirect("/forum");
    }
  }
};
