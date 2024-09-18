import { addCommentAction } from "@/app/(routes)/forum/forumActions";
import MDXEditor from "@/app/components/MDXEditor";
import { PostImage } from "@/app/types/types";
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
  if (!session) return notFound();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState("");
  const [images, setImages] = useState<PostImage[]>([]);

  const sendComment = async () => {
    try {
      startTransition(async () => {
        const res = await addCommentAction(
          inputValue,
          targetId,
          isReply ? isReply : false,
        );
        if (!res.success) throw new Error(`${res.message}`);
        setInputValue("");
        closeWindow();
      });
    } catch (error) {
      toast.error(`${error}`);
    }
  };
  return (
    <>
      <MDXEditor
        mdxContent={[inputValue, setInputValue]}
        postImages={[images, setImages]}
      />
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
