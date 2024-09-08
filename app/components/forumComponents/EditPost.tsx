"use client";

import { deletePostAction } from "@/app/(routes)/forum/forumActions";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
const EditPostEditor = dynamic(() => import("./EditPostEditor"));
type EditPostProps = {
  initialContent: string;
  targetId: string;
  isPost: boolean;
};
export default function EditPost({
  initialContent,
  targetId,
  isPost,
}: EditPostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathaname = usePathname();

  const deletePost = async () => {
    await deletePostAction(targetId, isPost, pathaname);
  };

  return (
    <>
      {isOpen ? (
        <Suspense>
          <div className="relative col-start-1 col-end-2 row-start-1 row-end-2 mt-5">
            <EditPostEditor
              initialContent={initialContent}
              closeWindow={() => setIsOpen(false)}
              targetId={targetId}
              isPost={isPost}
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
                  Na pewno usunąć {isPost ? "post" : "komentarz"}?
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
