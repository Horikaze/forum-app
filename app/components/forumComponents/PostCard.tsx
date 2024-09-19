import { Reaction } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { PostDataProps } from "../../types/prismaTypes";
import { areDatesEqual, formatDatePost } from "../../utils/formatDate";
import AddReaction from "./AddReaction";
import AddReplyToComment from "./AddReplyToComment";
import EditPost from "./EditPost";
import ReplyComponent from "./ReplyComponent";
import BlogListCard from "./BlogListCard";
import { cn } from "@/app/utils/twUtils";

type ReactionWithUserNickname = Reaction & {
  user: {
    nickname: string;
  };
};

export type segregateReactionsType = {
  segregated: Record<string, ReactionWithUserNickname[]>;
  isPost: boolean;
  total: number;
};
export const segregateReactionsByType = (
  initialReactions: ReactionWithUserNickname[],
  isPost?: boolean,
): segregateReactionsType => {
  const segregated: Record<string, ReactionWithUserNickname[]> = {};

  initialReactions.forEach((reaction) => {
    const { type } = reaction;
    if (!segregated[type]) {
      segregated[type] = [];
    }
    segregated[type].push(reaction);
  });

  return {
    segregated,
    isPost: isPost ?? false,
    total: initialReactions.length,
  };
};
export type PostCardProps = {
  post: PostDataProps;
  renderer: React.ElementType<{ markdown: string }>;
  hideReactions?: boolean;
  hideReply?: boolean;
  isBlog?: boolean;
  replays?: PostDataProps[];
  isPost?: boolean;
  currentUserId?: string;
};
export default function PostCard({
  post,
  renderer: Renderer,
  hideReply,
  hideReactions,
  isBlog,
  replays,
  isPost,
  currentUserId,
}: PostCardProps) {
  const reactionsSorted = segregateReactionsByType(post.reactions, isPost);
  return (
    <>
      {!isBlog ? (
        <>
          <h2 className="text-2xl font-semibold">{post.title}</h2>
          {post.subTitle ? (
            <p className="text-sm opacity-80">{post.subTitle}</p>
          ) : null}
        </>
      ) : (
        <BlogListCard
          title={post.title}
          subTitle={post.subTitle!}
          isPreview
          featuredImage={post.featuredImage!}
          commentsCount={post._count.comments}
          reactionsCount={post._count.reactions}
        />
      )}
      <div className="group relative grid grid-cols-1">
        <div
          className={cn(
            "col-start-1 col-end-2 row-start-1 row-end-2 mt-5 flex flex-col rounded-box bg-base-200 p-2 lg:gap-2 lg:p-4",
            isBlog ? "mt-0 rounded-t-none" : "lg:flex-row",
          )}
        >
          <div
            className={cn(
              "flex shrink-0 flex-row gap-1",
              isBlog ? "items-center" : "lg:w-52 lg:flex-col lg:items-end",
            )}
          >
            <div
              className={cn("size-28 overflow-hidden", isBlog ? "size-16" : "")}
            >
              <Image
                src={post.author.profileImage || "/images/placeholder.png"}
                alt={post.author.nickname}
                width="0"
                height="0"
                sizes="100vw"
                className="h-auto w-full rounded-box"
              />
            </div>
            <Link
              href={`/user/${post.author.id}`}
              className={cn(
                "link-hover text-end font-semibold text-warning",
                isBlog ? "ml-4 text-lg" : "",
              )}
            >
              {post.author.nickname}
            </Link>
            {!isBlog ? (
              <div
                className={cn(
                  "ml-auto flex flex-col opacity-80",
                  isBlog ? "hidden" : "",
                )}
              >
                <span className="text-end text-xs">
                  {post.author.role.toLowerCase()}
                </span>
                <span className="text-end text-xs font-semibold">
                  Posty:{" "}
                  <span className="font-normal">
                    {post.author._count.posts}
                  </span>
                </span>
                <span className="text-end text-xs font-semibold">
                  Karma:{" "}
                  <span className="font-normal">{post.author.karma}</span>
                </span>
                <span className="text-end text-xs font-semibold">
                  Rejestracja:{" "}
                  <span className="font-normal">
                    {formatDatePost(post.author.createdAt)}
                  </span>
                </span>
                {post.id}
              </div>
            ) : null}
            {isBlog ? (
              <>
                <div className="divider divider-horizontal" />
                <div className="flex items-center gap-1 text-center font-semibold opacity-80">
                  <p>{formatDatePost(post.createdAt)}</p>
                  {!areDatesEqual(post.createdAt, post.updatedAt) ? (
                    <p className="text-xs opacity-60">
                      (Edytowano: {formatDatePost(post.updatedAt)})
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
          <div
            className={cn(
              "divider my-0",
              isBlog ? "" : "lg:divider-horizontal",
            )}
          />
          <div className="flex flex-1 flex-col gap-1">
            {!isBlog ? (
              <div className="flex gap-1 text-end text-sm opacity-80">
                <p>{formatDatePost(post.createdAt)}</p>
                {!areDatesEqual(post.createdAt, post.updatedAt) ? (
                  <p className="text-xs opacity-60">
                    (Edytowano: {formatDatePost(post.updatedAt)})
                  </p>
                ) : null}
              </div>
            ) : null}
            <Renderer markdown={post.content} />
            <div className="mr-12 mt-auto flex flex-col items-end justify-center">
              {!hideReactions ? (
                <AddReaction
                  initialReactions={reactionsSorted}
                  targetId={post.id}
                  isPost={reactionsSorted.isPost}
                />
              ) : null}
            </div>
          </div>
        </div>
        {currentUserId === post.author.id ? (
          <>
            <EditPost
              targetId={post.id}
              post={post}
              isBlog={isBlog}
              isPost={reactionsSorted.isPost}
            />
          </>
        ) : null}
      </div>
      {replays ? (
        <div className="flex flex-col">
          {replays.map((r, idx) => (
            <ReplyComponent
              key={r.id}
              post={r}
              renderer={Renderer}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : null}
      {hideReply ? null : <AddReplyToComment postId={post.id} />}
    </>
  );
}
