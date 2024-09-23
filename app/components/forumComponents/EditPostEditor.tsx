import { editPostAction } from "@/app/(routes)/forum/forumActions";
import ChangeImage from "@/app/(routes)/profile/components/ChangeImage";
import { PostDataProps } from "@/app/types/prismaTypes";
import { PostImage } from "@/app/types/types";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import MDXEditor from "../MDXEditor";
import { PreviewBlog } from "../MDXPreview";

type EditPostEditorProps = {
  closeWindow: () => void;
  post: PostDataProps;
  targetId: string;
  isPost: boolean;
  isBlog?: boolean;
};

export default function EditPostEditor({
  closeWindow,
  post,
  targetId,
  isPost,
  isBlog,
}: EditPostEditorProps) {
  const [inputValue, setInputValue] = useState(post.content);
  const [images, setImages] = useState<PostImage[]>(
    post.images?.split("+")!.map((i) => ({
      name: i.split("/").at(-1),
      url: i,
    })) || [],
  );
  const [title, setTitle] = useState(post.title || "");
  const [subTitle, setSubTitle] = useState(post.subTitle || "");
  const [isPending, setIsPending] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(
    post.featuredImage || undefined,
  );
  const [featuredImageFile, setFeaturedImageFile] = useState<File | undefined>(
    undefined,
  );
  const pathname = usePathname();
  console.log(images);
  const updatePost = async () => {
    try {
      setIsPending(true);
      const dataToUpdate: Record<string, string | File> = {};
      if (title && title !== post.title) {
        dataToUpdate.title = title;
      }
      if (subTitle && subTitle !== post.subTitle && post.subTitle) {
        dataToUpdate.subTitle = subTitle;
      }
      if ((inputValue && inputValue !== post.content) || inputValue === "") {
        dataToUpdate.content = inputValue;
      }
      if (featuredImageFile && featuredImageFile.size! > 2000 * 1024) {
        throw new Error("Obrazek może mieć maksymalnie 2MB");
      }
      const res = await editPostAction({
        currentUrl: pathname,
        dataToUpdate,
        isPost,
        targetId,
        featuredImageFile: featuredImageFile || undefined,
        images: images,
      });
      if (!res.success) throw new Error(`${res.message}`);
      toast.success(res.message);
      setInputValue("");
      closeWindow();
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };
  const changeImageFn = (url: string) => {
    if (featuredImage && url !== featuredImage) {
      try {
        URL.revokeObjectURL(featuredImage); // Revoke previous image URL
      } catch (error) {
        console.error("Error revoking object URL:", error);
      }
    }
    setFeaturedImage(url);
  };
  return (
    <div className="flex min-h-full flex-col rounded-box bg-base-200">
      {isPost ? (
        <div className="flex flex-col gap-2 p-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            name="title"
            className="input input-sm input-bordered"
          />
          <input
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            type="text"
            name="subTitle"
            className="input input-sm input-bordered"
          />
        </div>
      ) : null}
      <MDXEditor
        mdxContent={[inputValue, setInputValue]}
        postImages={[images, setImages]}
        preview={
          isBlog
            ? (p) => (
                <PreviewBlog
                  post={{
                    ...p,
                    ...post,
                    content: inputValue,
                    title: title!,
                    subTitle: subTitle!,
                    featuredImage: featuredImage!,
                  }}
                />
              )
            : undefined
        }
      />
      <div className="z-30 flex items-center justify-end gap-5 bg-base-200 p-2">
        {isBlog ? (
          <ChangeImage
            aspect={3 / 1}
            onImageChange={changeImageFn}
            onImageChangeFile={setFeaturedImageFile}
          >
            <button className="btn">Zmień obrazek</button>
          </ChangeImage>
        ) : null}
        <button
          type="button"
          onClick={closeWindow}
          className="btn btn-ghost ml-auto"
        >
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
