"use client";

import { cn } from "@/app/utils/twUtils";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { FaReply } from "react-icons/fa6";
const AddCommentEditor = dynamic(() => import("./AddCommentEditor"));

export type AddCommentProps = {
  postId: string;
};
export default function AddReplyToComment({ postId }: AddCommentProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status, update } = useSession();
  if (!session && status !== "loading") {
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
          data-tip="Odpowiedz"
          disabled={status === "loading"}
          onClick={() => setIsOpen((p) => !p)}
          className={cn(
            "btn btn-sm tooltip relative -top-10 right-2 z-10 lg:-top-12 lg:right-4",
            isOpen ? "btn-primary" : "btn-ghost",
          )}
        >
          <FaReply className="size-5 opacity-80" />
        </button>
      </div>
      {isOpen ? (
        <Suspense>
          <div className="mt-5 flex w-full">
            <div className="relative ml-10 w-full rounded-box bg-base-200 p-5 lg:ml-20">
              <AddCommentEditor
                session={session}
                targetId={postId}
                isReply={true}
                closeWindow={() => setIsOpen(false)}
              />

              {/* <div className="div pointer-events-none absolute -left-5 bottom-[calc(50%-0.15rem)] -z-10 h-[calc(50%+14rem)] w-full rounded-box rounded-tl-none border-b-4 border-l-4 border-base-300" /> */}
            </div>
          </div>
        </Suspense>
      ) : null}
    </div>
  );
}
