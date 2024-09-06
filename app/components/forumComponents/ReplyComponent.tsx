import PostCard, { PostCardProps } from "./PostCard";

export default function ReplyComponent({
  post,
  renderer,
  currentUserId,
}: PostCardProps) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex w-full">
        <div className="relative ml-10 w-full lg:ml-20">
          <PostCard
            post={post}
            renderer={renderer}
            hideReply
            currentUserId={currentUserId}
          />
          <div className="div pointer-events-none absolute -left-5 bottom-[calc(50%-0.75rem)] -z-10 h-[calc(100%+2rem)] w-full rounded-box rounded-tl-none border-b-4 border-l-4 border-base-300"/>
        </div>
      </div>
    </div>
  );
}
