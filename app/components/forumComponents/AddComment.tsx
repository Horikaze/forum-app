"use client";

import { cn } from "@/app/utils/twUtils";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaArrowDown } from "react-icons/fa6";
const AddCommentEditor = dynamic(() => import("./AddCommentEditor"));

export type AddCommentProps = {
  postId: string;
};
export default function AddComment({ postId }: AddCommentProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status, update } = useSession();
  if (!session) {
    return (
      <div className="mt-5 flex flex-col items-center">
        <Link
          href={`/login?redirectTo=${pathname}`}
          className="btn btn-ghost btn-sm"
        >
          Skomentuj <FaArrowDown />
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-5 flex flex-col items-center">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="btn btn-ghost btn-sm"
      >
        Skomentuj
        <FaArrowDown
          className={cn("transition-all", isOpen ? "rotate-180" : "rotate-0")}
        />
      </button>
      {isOpen ? (
        <AddCommentEditor
          session={session}
          targetId={postId}
          closeWindow={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  );
}
