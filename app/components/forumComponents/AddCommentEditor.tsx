import { addCommentAction } from "@/app/(routes)/forum/forumActions";
import MDXEditor from "@/app/components/MDXEditor";
import { Session } from "next-auth";
import { notFound, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPaperPlane } from "react-icons/fa6";

type AddCommentEditorProps = {
  session: Session | null;
  targetId: string;
  isReply?: boolean;
  closeWindow: () => void;
};

export default function AddCommentEditor({
  targetId,
  session,
  isReply,
  closeWindow,
}: AddCommentEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  if (!session) return notFound();

  const sendComment = async () => {
    startTransition(async () => {
      const res = await addCommentAction(
        content,
        targetId,
        isReply ? isReply : false,
      );
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setContent("");
      closeWindow();
    });
  };
  return (
    <>
      <MDXEditor getRawMDXValue={content} setRawMDXValue={setContent} />
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
