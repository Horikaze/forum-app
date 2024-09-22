import { cn } from "@/app/utils/twUtils";
import PostCard, { PostCardProps } from "./PostCard";
import AddReplyToComment from "./AddReplyToComment";

export default function ReplyComponent({
  post,
  renderer,
  currentUserId,
  isLast,
  hideReply,
}: PostCardProps & {
  isLast?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-end")}>
      <div className="flex w-full">
        <div className="relative ml-10 w-full lg:ml-20">
          <PostCard
            post={post}
            renderer={renderer}
            hideReply
            currentUserId={currentUserId}
          />
          <div className="div pointer-events-none absolute -left-5 bottom-[calc(50%-0.75rem)] -z-10 h-[calc(50%+10rem)] w-full rounded-box rounded-tl-none border-b-4 border-l-4 border-base-300" />
          {!isLast ? (
            <div className="div pointer-events-none absolute -left-5 bottom-0 -z-10 h-[calc(100%+10rem)] w-full border-l-4 border-base-300" />
          ) : null}
        </div>
      </div>
      {!hideReply ? null : <AddReplyToComment postId={post.id} />}
    </div>
  );
}
