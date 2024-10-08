"use client";

import { deletePostAction } from "@/app/(routes)/forum/forumActions";
import { PostDataProps } from "@/app/types/prismaTypes";
import { cn } from "@/app/utils/twUtils";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
const EditPostEditor = dynamic(() => import("./EditPostEditor"));
type EditPostProps = {
  post: PostDataProps;
  targetId: string;
  isPost: boolean;
  isBlog?: boolean;
};
export default function EditPost({
  post,
  targetId,
  isPost,
  isBlog,
}: EditPostProps) {
  const [isOpen, setIsOpen] = useState(false);

  const deletePost = async () => {
    await deletePostAction(targetId, isPost);
  };

  return (
    <>
      {isOpen ? (
        <Suspense>
          <div
            className={cn(
              "relative col-start-1 col-end-2 row-start-1 row-end-2 mt-5",
              isBlog ? "mt-0" : "",
            )}
          >
            <EditPostEditor
              post={post}
              closeWindow={() => setIsOpen(false)}
              targetId={targetId}
              isPost={isPost}
              isBlog={isBlog}
            />
          </div>
        </Suspense>
      ) : (
        <>
          <div className="dropdown dropdown-end absolute right-12 top-5 mt-5 opacity-0 transition-all group-hover:opacity-100">
            <button
              tabIndex={0}
              className="flex size-6 cursor-pointer items-center justify-center rounded-sm opacity-60 hover:opacity-100"
              role="button"
            >
              <FaTrash className="size-4 text-warning" />
            </button>
            <div
              tabIndex={0}
              className="card dropdown-content card-compact z-10 items-center justify-center whitespace-nowrap bg-base-300 shadow"
            >
              <div tabIndex={0} className="card-body">
                <p className="text-warning">
                  Na pewno chcesz usunąć {isPost ? "post" : "komentarz"}?
                </p>
                <button onClick={deletePost} className="btn btn-warning btn-sm">
                  Usuń
                </button>
              </div>
            </div>
          </div>
          <div className="absolute right-5 top-5 mt-5 opacity-0 transition-all group-hover:opacity-100">
            <button
              onClick={() => setIsOpen((p) => !p)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-opacity hover:opacity-100"
              role="button"
              tabIndex={0}
            >
              <FaPen className="size-4" />
            </button>
          </div>
        </>
      )}
    </>
  );
}
