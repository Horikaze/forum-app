import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import MDXEditor from "../MDXEditor";
import { editPostAction } from "@/app/(routes)/forum/forumActions";
import toast from "react-hot-toast";

type EditPostEditorProps = {
  closeWindow: () => void;
  initialContent: string;
  targetId: string;
  isPost: boolean;
};

export default function EditPostEditor({
  closeWindow,
  initialContent,
  targetId,
  isPost,
}: EditPostEditorProps) {
  const [content, setContent] = useState(initialContent);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const updatePost = async () => {
    startTransition(async () => {
      const res = await editPostAction(targetId, isPost, pathname, content);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setContent("");
      closeWindow();
    });
  };

  return (
    <div className="flex min-h-full flex-col rounded-box bg-base-200">
      <MDXEditor getRawMDXValue={content} setRawMDXValue={setContent} />
      <div className="z-30 flex items-center justify-end gap-5 bg-base-200 p-2">
        <button onClick={closeWindow} className="btn btn-ghost">
          Anuluj
        </button>
        <button
          onClick={updatePost}
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? <span className="loading loading-spinner" /> : null}
          Zapisz
        </button>
      </div>
    </div>
  );
}
