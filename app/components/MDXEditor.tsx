import React, { useEffect, useRef, useState } from "react";
import { FaArrowsUpDown, FaImage, FaRegFaceSmile, FaX } from "react-icons/fa6";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { emoticons } from "@/app/constants/emotes";
import { Emoticon } from "@/mdx-components";
import { UserRole, validFileExtensions } from "../constants/forum";
import { PostDataProps } from "../types/prismaTypes";
import { PostImage } from "../types/types";
import { cn } from "../utils/twUtils";
import { PreviewPost } from "./MDXPreview";

type MDXEditorProps = {
  mdxContent: [string, React.Dispatch<React.SetStateAction<string>>];
  postImages: [PostImage[], React.Dispatch<React.SetStateAction<PostImage[]>>];
  preview?: React.ElementType<{ post: PostDataProps }>;
};

const MDXEditor: React.FC<MDXEditorProps> = ({
  mdxContent,
  postImages,
  preview: Preview = PreviewPost,
}) => {
  const [isReversed, setIsReversed] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const [contentValue, setContentValue] = mdxContent;
  const [images, setImages] = postImages;
  const [post, setPost] = useState<PostDataProps>(() => ({
    id: "1",
    content: contentValue,
    createdAt: new Date(),
    subTitle: "",
    featuredImage: "",
    title: "",
    updatedAt: new Date(),
    reactions: [],
    _count: {
      comments: 9,
      reactions: 23,
    },
    author: {
      id: "",
      nickname: session?.user.name || "Cirno",
      profileImage: session?.user.image || "/images/placeholder.png",
      role: UserRole.USER,
      createdAt: new Date(),
      karma: 999,
      _count: {
        posts: 9,
      },
    },
  }));

  useEffect(() => {
    images.forEach((element) => {
      if (!contentValue.includes(element.url)) {
        setImages((p) => p.filter((i) => i.url !== element.url));
        URL.revokeObjectURL(element.url);
      }
    });
    setPost((prevPost) => ({ ...prevPost, content: contentValue }));
  }, [contentValue]);

  const insertText = (insertedText: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue =
        contentValue.substring(0, start) +
        insertedText +
        contentValue.substring(end);
      setContentValue(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + insertedText.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const addImage = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      const imageName = file.name;
      if (!images.some((image) => image.name === imageName)) {
        setImages((prev) => [
          ...prev,
          { name: imageName, url: imageUrl, file: file },
        ]);
      }
      insertText(`<img src="${imageUrl}" />`);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardItems = e.clipboardData?.items;
    if (clipboardItems) {
      for (const item of clipboardItems) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            addImage(file);
          }
        }
      }
    }
  };

  const deleteImageFromMd = (url: string) => {
    const regex = new RegExp(`<img\\s+[^>]*src=['"]${url}['"][^>]*>`, "g");
    URL.revokeObjectURL(url);
    setContentValue((p) => p.replace(regex, ""));
    setImages((prev) => prev.filter((s) => s.url !== url));
  };

  return (
    <div className="mx-auto w-full">
      {images.length > 0 ? (
        <div className="mb-2 flex flex-col items-center rounded-box bg-base-200 p-2 font-semibold">
          <span>Zdjęcia w poście</span>
          <div className="flex w-full flex-wrap gap-1">
            {images.map((i, idx) => (
              <div key={idx} className="relative">
                <div
                  onClick={() => {
                    deleteImageFromMd(i.url);
                  }}
                  className="absolute right-0 top-0 z-20 flex size-5 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-warning p-px text-warning-content"
                >
                  <FaX />
                </div>
                <div className="relative h-20 select-none">
                  <Image
                    draggable={false}
                    width="0"
                    height="0"
                    sizes="100vw"
                    className="h-full w-auto rounded-md"
                    src={i.url}
                    alt={i.name}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          "isolate flex",
          isReversed ? "flex-col-reverse" : "flex-col",
        )}
      >
        <div className="rounded-box bg-base-200 p-2">
          <div
            className="relative size-full"
            onDrop={(e) => {
              e.preventDefault();
              addImage(e.dataTransfer.files[0]);
            }}
          >
            <textarea
              ref={textareaRef}
              onPaste={handlePaste}
              placeholder="Tu pisz..."
              onChange={(e) => setContentValue(e.target.value)}
              value={contentValue}
              className="textarea size-full min-h-32 min-w-52 rounded-box border-base-300"
            />
            <div role="button" className="absolute bottom-3 right-10">
              <input
                type="file"
                hidden
                id="addImage"
                onChange={(e) => {
                  addImage(e.target.files![0]);
                }}
                accept={validFileExtensions.join(",")}
                multiple={false}
              />
              <label htmlFor="addImage">
                <FaImage
                  className="size-5 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
                  tabIndex={0}
                />
              </label>
            </div>
            <div
              role="button"
              className="dropdown dropdown-end dropdown-top absolute bottom-3 right-3"
            >
              <FaRegFaceSmile
                className="size-5 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
                tabIndex={0}
              />
              <div
                tabIndex={0}
                className="card dropdown-content card-compact z-10 mb-1 items-center justify-center bg-base-300 shadow"
              >
                <div className="flex p-1">
                  {Object.entries(emoticons).map(([name, src]) => (
                    <div
                      key={name}
                      onClick={() => insertText(`:${name}:`)}
                      className="size-10 cursor-pointer rounded-full p-2 transition-all hover:bg-base-100"
                    >
                      <Emoticon src={src} alt={name} className="size-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="divider">
          <div className="z-20" onClick={() => setIsReversed((prev) => !prev)}>
            <FaArrowsUpDown className="size-10 cursor-pointer rounded-full p-2 opacity-50 transition-all hover:opacity-100" />
          </div>
        </div>
        <div>
          <Preview post={post} />
        </div>
      </div>
    </div>
  );
};

export default MDXEditor;
