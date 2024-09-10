"use client";
import { addReactionAction } from "@/app/(routes)/forum/forumActions";
import { emoticons } from "@/app/constants/emotes";
import { cn } from "@/app/utils/twUtils";
import { Emoticon } from "@/mdx-components";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegFaceSmile } from "react-icons/fa6";
import { segregateReactionsType } from "./PostCard";

export default function AddReaction({
  initialReactions,
  targetId,
  isPost,
}: {
  initialReactions: segregateReactionsType;
  targetId: string;
  isPost: boolean;
}) {
  const [reactions, setReactions] = useState(initialReactions);
  const [lastClicked, setLastClicked] = useState<Date | null>(null);
  const { data } = useSession();
  const addReaction = async (reactionType: string) => {
    try {
      if (lastClicked) {
        const timeElapsed = new Date().getTime() - lastClicked.getTime();
        const timeLeft = 2000 - timeElapsed;
        if (timeLeft > 0) {
          toast.error(`Poczekaj ${Math.ceil(timeLeft / 1000)}s`);
          return;
        }
      }
      setLastClicked(new Date());
      const res = await addReactionAction(reactionType, targetId, isPost);
      if (!res.success) throw new Error(`${res.message}`);
      setReactions(res.reactions);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Object.keys(reactions.segregated).map((r) => {
        return (
          <div
            key={r}
            className="tooltip tooltip-accent"
            data-tip={
              `${r}: ` +
              reactions.segregated[r].map((r) => r.user.nickname).join(", ")
            }
          >
            <button
              className={cn(
                "flex w-12 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-base-300 p-1 transition-all",
                reactions.segregated[r].some((a) => a.userId === data?.user.id)
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-100",
              )}
              onClick={() => {
                addReaction(r);
              }}
            >
              <Image src={emoticons[r]} alt={r} width={22} height={22} />
              <span className="font-semibold">
                {reactions.segregated[r].length}
              </span>
            </button>
          </div>
        );
      })}
      <div className="dropdown dropdown-end dropdown-top dropdown-hover">
        <div
          className="flex size-8 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-opacity hover:opacity-100"
          role="button"
          tabIndex={0}
        >
          <FaRegFaceSmile className="size-6" />
        </div>
        <div
          tabIndex={0}
          className="card dropdown-content card-compact z-10 mb-1 items-center justify-center bg-base-300 shadow"
        >
          <div className="flex p-1">
            {Object.keys(emoticons).map((r) => (
              <div
                onClick={() => {
                  addReaction(r);
                }}
                key={r}
                className="size-10 cursor-pointer rounded-full p-2 transition-all hover:bg-base-100"
              >
                <Emoticon
                  src={emoticons[r]}
                  alt={r.toLowerCase()}
                  className="size-6"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
