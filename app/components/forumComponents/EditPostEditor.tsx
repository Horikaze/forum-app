import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import MDXEditor from "../MDXEditor";
import { editPostAction } from "@/app/(routes)/forum/forumActions";
import toast from "react-hot-toast";
import { PostDataProps } from "@/app/types/prismaTypes";

type EditPostEditorProps = {
  closeWindow: () => void;
  post: PostDataProps;
  targetId: string;
  isPost: boolean;
};

export default function EditPostEditor({
  closeWindow,
  post,
  targetId,
  isPost,
}: EditPostEditorProps) {
  const [content, setContent] = useState(post.content);
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const updatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsPending(true);
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const title = formData.get("title") as string;
      const subTitle = formData.get("subTitle") as string;
      const dataToUpdate: Record<string, string> = {};
      if (title !== post.title && post.title != null) {
        dataToUpdate.title = title;
      }
      if (subTitle !== post.subTitle && post.subTitle != null) {
        dataToUpdate.subTitle = subTitle;
      }
      if (content !== post.content && post.content != null) {
        dataToUpdate.content = content;
      }
      console.log(dataToUpdate);
      const res = await editPostAction(
        targetId,
        isPost,
        pathname,
        dataToUpdate,
      );
      if (!res.success) throw new Error(`${res.message}`);
      setContent("");
      closeWindow();
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={updatePost}
      className="flex min-h-full flex-col rounded-box bg-base-200"
    >
      {isPost ? (
        <div className="flex flex-col gap-2 p-2">
          <input
            defaultValue={post.title}
            type="text"
            name="title"
            className="input input-sm input-bordered"
          />
          <input
            defaultValue={post.subTitle!}
            type="text"
            name="subTitle"
            className="input input-sm input-bordered"
          />
        </div>
      ) : null}
      <MDXEditor getRawMDXValue={content} setRawMDXValue={setContent} />
      <div className="z-30 flex items-center justify-end gap-5 bg-base-200 p-2">
        <button type="button" onClick={closeWindow} className="btn btn-ghost">
          Anuluj
        </button>
        <button className="btn btn-primary" disabled={isPending}>
          {isPending ? <span className="loading loading-spinner" /> : null}
          Zapisz
        </button>
      </div>
    </form>
  );
}
