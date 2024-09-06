"use client";

import { cn } from "@/app/utils/twUtils";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaReply } from "react-icons/fa6";
const AddCommentEditor = dynamic(() => import("./AddCommentEditor"));

export type AddCommentProps = {
  postId: string;
};
export default function AddReplyToComment({ postId }: AddCommentProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status, update } = useSession();
  if (!session) {
    return (
      <div className="flex flex-col items-end">
        <div className="h-0">
          <Link
            href={`/login?redirectTo=${pathname}`}
            className="btn btn-ghost btn-sm relative -top-10 right-2 z-10 lg:-top-12 lg:right-4"
          >
            <FaReply className="size-5 opacity-80" />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-end">
      <div className="h-0">
        <button
          onClick={() => setIsOpen((p) => !p)}
          className={cn(
            "btn btn-sm relative -top-10 right-2 z-10 lg:-top-12 lg:right-4",
            isOpen ? "btn-primary" : "btn-ghost",
          )}
        >
          <FaReply className="size-5 opacity-80" />
        </button>
      </div>
      {isOpen ? (
        <div className="mt-5 flex w-full">
          <div className="relative ml-10 w-full lg:ml-20 bg-base-200 rounded-box p-5">
            <AddCommentEditor
              session={session}
              targetId={postId}
              isReply={true}
              closeWindow={() => setIsOpen(false)}
            />

            <div className="div pointer-events-none absolute -left-5 bottom-[calc(50%-0.15rem)] -z-10 h-[calc(100%+2rem)] w-full rounded-box rounded-tl-none border-b-4 border-l-4 border-base-300"/>
          </div>
        </div>
      ) : null}
    </div>
  );
}
