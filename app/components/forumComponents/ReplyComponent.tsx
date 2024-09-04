import { cn } from "@/app/utils/twUtils";
import PostCard, { PostCardProps } from "./PostCard";

export default function ReplyComponent({ post, renderer }: PostCardProps) {
  return (
    <div className="flex flex-col items-end">
      <div className="w-full flex">
        <div className="w-full ml-10 lg:ml-20 relative">
          <PostCard post={post} renderer={renderer} hideReply />
          <div className="div absolute -left-5 border-l-4 rounded-box  rounded-tl-none border-b-4 bottom-1/2 -z-10 border-base-300 pointer-events-none w-full h-[calc(100%+2rem)]"></div>
        </div>
      </div>
    </div>
  );
}
