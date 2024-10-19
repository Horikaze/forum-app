import { TopicListProp } from "@/app/types/prismaTypes";
import { formatDatePost } from "@/app/utils/formatDate";
import Link from "next/link";
import { FaMessage, FaReply, FaThumbsUp } from "react-icons/fa6";
import { IoChatboxEllipses } from "react-icons/io5";

export default function TopicListCard({
  _count,
  createdAt,
  subTitle,
  category,
  title,
  comments,
  author,
  slug,
}: TopicListProp) {
  return (
    <div className="bg-base-200 hover:bg-base-300 w-full flex flex-col rounded-box md:p-4 p-2 lg:flex-row lg:items-center gap-1 justify-between transition-colors cursor-pointer border-b-2 border-base-100">
      <div className="flex lg:gap-5 gap-2 items-center">
        <div className="bg-base-100 p-3 rounded-full">
          <FaMessage className="size-4" />
        </div>
        <div className="flex flex-col">
          <Link
            href={`/forum/${category.toLocaleLowerCase()}/${slug}`}
            className="font-semibold text-sm link-hover"
          >
            {title}
          </Link>
          {subTitle ? (
            <span className="text-sm opacity-80">{subTitle}</span>
          ) : null}
          <p className="text-xs mt-1">
            <span className="opacity-80">autor: </span>
            <Link
              href={`/profile/${author.id}`}
              className="text-warning font-bold link-hover"
            >
              {author.nickname}
            </Link>
            <span className="opacity-80"> » {formatDatePost(createdAt)}</span>
          </p>
        </div>
        <div className="ml-auto lg:hidden flex items-center gap-1 opacity-80">
          <FaThumbsUp /> <span className="mr-1">{_count.reactions}</span>
          <IoChatboxEllipses /> <span>{_count.comments}</span>
        </div>
      </div>
      <div className="flex lg:gap-5 gap-1 items-center text-center whitespace-nowrap">
        <span className="lg:hidden ml-12">
          {comments[0] ? <FaReply /> : null}
        </span>
        <span className="lg:inline hidden w-20 opacity-80">
          {_count.comments}
        </span>
        <span className="lg:inline hidden w-20 opacity-80">{_count.reactions}</span>
        <div className="lg:w-44 flex text-start lg:flex-col gap-1 text-xs">
          {comments[0] ? (
            <>
              <p>
                <span className="lg:inline hidden opacity-80">autor: </span>
                <Link
                  href={`/profile/${comments[0].author.id}`}
                  className="text-warning font-bold hover:link link-hover"
                >
                  {comments[0].author.nickname}
                </Link>
              </p>
              <p className="opacity-80">
                <span className="inline lg:hidden">» </span>
                {formatDatePost(comments[0].createdAt)}
              </p>
            </>
          ) : (
            <span className="hidden text-base opacity-80 lg:inline">Brak</span>
          )}
        </div>
      </div>
    </div>
  );
}
