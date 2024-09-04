import { Reaction } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { PostDataProps } from "../../types/prismaTypes";
import { formatDatePost } from "../../utils/formatDate";
import AddReaction from "./AddReaction";
import AddReplyToComment from "./AddReplyToComment";
import ReplyComponent from "./ReplyComponent";

export type PostCardProps = {
  post: PostDataProps;
  renderer: React.ElementType<{ markdown: string }>;
  hideReply?: boolean;
  replays?: PostDataProps[];
  isPost?: boolean;
};
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
export default function PostCard({
  post,
  renderer: Renderer,
  hideReply,
  replays,
  isPost,
}: PostCardProps) {
  const reactionsSorted = segregateReactionsByType(post.reactions, isPost);
  return (
    <div>
      <div className="relative mt-5 flex flex-col rounded-box bg-base-200 p-2 lg:flex-row lg:gap-2 lg:p-4">
        <div className="flex shrink-0 flex-row gap-1 lg:w-52 lg:flex-col lg:items-end">
          <div className="size-16 overflow-hidden lg:size-24">
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
            className="link-hover text-end font-semibold text-warning"
          >
            {post.author.nickname}
          </Link>
          <div className="ml-auto flex flex-col opacity-80">
            <span className="text-end text-xs">
              {post.author.role.toLowerCase()}
            </span>
            <span className="text-end text-xs font-semibold">
              Posty:{" "}
              <span className="font-normal">{post.author._count.posts}</span>
            </span>
            <span className="text-end text-xs font-semibold">
              Karma: <span className="font-normal">{post.author.karma}</span>
            </span>
            <span className="text-end text-xs font-semibold">
              Rejestracja:{" "}
              <span className="font-normal">
                {formatDatePost(post.author.createdAt)}
              </span>
            </span>
          </div>
        </div>
        <div className="divider my-0 lg:divider-horizontal" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex justify-between text-end text-sm opacity-80">
            <p>{formatDatePost(post.createdAt)}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <Renderer markdown={post.content} />
          </div>
          <div className="mr-12 flex flex-col items-end justify-center">
            <AddReaction
              initialReactions={reactionsSorted}
              targetId={post.id}
              isPost={reactionsSorted.isPost}
            />
          </div>
        </div>
      </div>
      {replays ? (
        <div className="flex flex-col">
          {replays.map((r, idx) => (
            <ReplyComponent key={r.id} post={r} renderer={Renderer} />
          ))}
        </div>
      ) : null}
      {hideReply ? null : <AddReplyToComment postId={post.id} />}
    </div>
  );
}