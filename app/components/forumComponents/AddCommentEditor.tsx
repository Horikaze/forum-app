import { addCommentAction } from "@/app/(routes)/forum/forumActions";
import MDXEditor from "@/app/components/MDXEditor";
import { Session } from "next-auth";
import { notFound, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPaperPlane } from "react-icons/fa6";

type AddCommentEditorProps = {
  session: Session | null;
  postId: string;
  isReply?: boolean;
  closeWindow: () => void;
};

export default function AddCommentEditor({
  postId,
  session,
  isReply,
  closeWindow,
}: AddCommentEditorProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  if (!session) return notFound();

  const sendComment = async () => {
    startTransition(async () => {
      const res = await addCommentAction(
        comment,
        postId,
        pathname,
        isReply ? isReply : false,
        pathname.split("/")[2] + "Preview",
      );
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setComment("");
      closeWindow();
    });
  };
  return (
    <>
      <MDXEditor getRawMDXValue={comment} setRawMDXValue={setComment} />
      <div className="flex w-full items-center justify-end p-2">
        <button
          onClick={sendComment}
          disabled={isPending}
          className="btn btn-primary px-6"
          type="submit"
        >
          {isPending ? (
            <span className="loading loading-spinner" />
          ) : (
            <FaPaperPlane className="size-5" />
          )}
        </button>
      </div>
    </>
  );
}
