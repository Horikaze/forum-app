"use client";
import MDXEditor from "@/app/components/MDXEditor";
import { forumCategory } from "@/app/constants/forum";
import { TopicListProp } from "@/app/types/prismaTypes";
import { cn } from "@/app/utils/twUtils";
import { useSession } from "next-auth/react";
import { useActionState, useState } from "react";
import { FaRegCircleXmark } from "react-icons/fa6";
import { newPostAction } from "../forumActions";

import TopicListCard from "../../../components/forumComponents/TopicListCard";
import { UserRole } from "@prisma/client";
const date = new Date();
const dummyTopic: TopicListProp = {
  title: "",
  subTitle: "",
  createdAt: date,
  slug: "",
  category: "touhou",
  _count: {
    comments: 5,
    reactions: 23,
  },
  author: {
    nickname: "",
    id: "",
  },
  comments: [
    {
      author: {
        nickname: "CommenterUser",
        id: "",
      },
      createdAt: date,
    },
  ],
};
export default function NewPost({
  searchParams,
}: {
  searchParams: { forumTarget: string };
}) {
  const [title, setTitle] = useState("Mój epicki post");
  const [subTitle, setSubTitle] = useState("");
  const [inputValue, setInputValue] = useState<string>("");
  const [dbTarget, setDbTarget] = useState(
    searchParams.forumTarget || forumCategory[0].dbTarget,
  );
  const [previewPostCard, setPreviewPostCard] =
    useState<TopicListProp>(dummyTopic);
  const [state, action, isPending] = useActionState(newPostAction, null);
  const [showError, setShowError] = useState(true);
  const formAction = async (formData: FormData) => {
    formData.append("content", inputValue);
    formData.append("dbTarget", dbTarget);
    action(formData);
    setShowError(true);
  };
  const { data: session } = useSession();
  return (
    <div className="flex flex-col gap-2">
      <form className="flex size-full flex-col" action={formAction}>
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
              defaultValue={state?.prevState.title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => {
                showError ? setShowError(false) : null;
              }}
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
                defaultValue={state?.prevState.subTitle}
                className="w-full"
                maxLength={130}
                onChange={(e) => setSubTitle(e.target.value)}
                onFocus={() => {
                  showError ? setShowError(false) : null;
                }}
              />
              <span className="badge badge-ghost">Opcjonalnie</span>
            </label>
          </label>
        </div>
        <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
          <div className="mt-2 grid w-full grid-cols-2 gap-2">
            {forumCategory
              .slice(
                0,
                session?.user.role === UserRole.ADMIN || UserRole.MODERATOR
                  ? forumCategory.length
                  : -2,
              )
              .map((t) => (
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
              <button className="btn" type="button">
                Zapisz szkic
              </button>
              <button
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
      </form>
      {state?.message && showError ? (
        <div role="alert" className="alert alert-error">
          <FaRegCircleXmark />
          <span>{state?.message}</span>
        </div>
      ) : null}
      <MDXEditor
        setRawMDXValue={(e) => {
          setInputValue(e);
          showError ? setShowError(false) : null;
        }}
        getRawMDXValue={inputValue}
      />
      <div className="pointer-events-none">
        <TopicListCard
          {...previewPostCard}
          title={title}
          subTitle={subTitle}
          author={{
            ...previewPostCard.author,
            nickname: session?.user.name || "Cirno",
          }}
        />
      </div>
    </div>
  );
}
