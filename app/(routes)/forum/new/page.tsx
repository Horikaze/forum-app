"use client";
import MDXEditor from "@/app/components/MDXEditor";
import { PreviewBlog, PreviewPost } from "@/app/components/MDXPreview";
import {
  adminForumDb,
  forumCategory,
  userForumDb,
  UserRole,
} from "@/app/constants/forum";
import { cn } from "@/app/utils/twUtils";
import redirectHard from "@/lib/globalActions";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import ChangeImage from "../../profile/components/ChangeImage";
import { newPostAction } from "../forumActions";
import { PostDataProps } from "@/app/types/prismaTypes";
export default function NewPost({
  searchParams,
}: {
  searchParams: { forumTarget: string };
}) {
  const [title, setTitle] = useState("Mój epicki post");
  const [subTitle, setSubTitle] = useState("");
  const [inputValue, setInputValue] = useState<string>("");
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(
    undefined,
  );
  const [featuredImageFile, setFeaturedImageFile] = useState<File | undefined>(
    undefined,
  );
  const [dbTarget, setDbTarget] = useState(
    searchParams.forumTarget || forumCategory[0].dbTarget,
  );
  const [isPending, setIsPending] = useState(false);
  const formAction = async (isSketch = false) => {
    try {
      setIsPending(true);
      const newPostObject = {
        title,
        subTitle,
        dbTarget,
        content: inputValue,
        isSketch,
      };
      const res = await newPostAction(
        newPostObject,
        dbTarget === "blog" ? featuredImageFile : undefined,
      );
      if (!res?.success) throw new Error(res?.message);
      await redirectHard(res.message);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };
  const { data: session } = useSession();

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

  const previewPost = ({ post }: { post: PostDataProps }) => {
    if (dbTarget === "blog") {
      return (
        <PreviewBlog
          post={{
            ...post,
            title: title,
            subTitle: subTitle,
            featuredImage: featuredImage!,
          }}
        />
      );
    }
    return <PreviewPost post={{ ...post, title: title, subTitle: subTitle }} />;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex size-full flex-col">
        <div className="flex w-full flex-col gap-2 lg:flex-row">
          <label className="flex w-full flex-col">
            <div className="label flex justify-center">
              <span className="text-xl">Tytuł</span>
            </div>
            <input
              type="text"
              placeholder="Tytuł..."
              name="title"
              className="input input-bordered w-full"
              maxLength={130}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="flex w-full flex-col">
            <div className="label flex justify-center">
              <span className="text-xl">Opis</span>
            </div>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                placeholder="Opis..."
                name="subTitle"
                className="w-full"
                maxLength={130}
                onChange={(e) => setSubTitle(e.target.value)}
              />
              <span className="badge badge-ghost">Opcjonalnie</span>
            </label>
          </label>
        </div>
        <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
          <div className="mt-2 grid w-full grid-cols-2 gap-2">
            {[
              ...userForumDb,
              ...(session?.user.role === UserRole.ADMIN ||
              session?.user.role === UserRole.MODERATOR
                ? adminForumDb
                : []),
            ].map((t) => (
              <button
                key={t.title}
                className={cn("btn", {
                  "btn-primary": dbTarget === t.dbTarget,
                })}
                type="button"
                onClick={() => setDbTarget(t.dbTarget)}
              >
                {t.title}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col">
            <div className="label flex justify-center">
              <span className="text-xl">Publikacja</span>
            </div>
            <div className="flex justify-evenly">
              {dbTarget === "blog" ? (
                <ChangeImage
                  aspect={3 / 1}
                  onImageChange={changeImageFn}
                  onImageChangeFile={setFeaturedImageFile}
                >
                  <button className="btn">Zmień obrazek</button>
                </ChangeImage>
              ) : null}
              <button
                onClick={() => {
                  formAction(true);
                }}
                disabled={isPending}
                className="btn btn-secondary"
                type="button"
              >
                {isPending ? (
                  <span className="loading loading-spinner" />
                ) : null}
                Zapisz szkic
              </button>
              <button
                onClick={() => {
                  formAction();
                }}
                disabled={isPending}
                className="btn btn-primary"
                type="submit"
              >
                {isPending ? (
                  <span className="loading loading-spinner" />
                ) : null}
                Opublikuj
              </button>
            </div>
          </div>
        </div>
      </div>
      <MDXEditor
        setRawMDXValue={(e) => {
          setInputValue(e);
        }}
        getRawMDXValue={inputValue}
        preview={previewPost}
      />
    </div>
  );
}
