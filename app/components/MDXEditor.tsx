import { emoticons } from "@/app/constants/emotes";
import { Emoticon } from "@/mdx-components";
import { useSession } from "next-auth/react";
import React, { ChangeEvent, useId, useState } from "react";
import { FaRegFaceSmile } from "react-icons/fa6";
import { PostDataProps } from "../types/prismaTypes";
import MDXRenderer from "./MDXRenderer";
import PostCard from "./forumComponents/PostCard";
type MDXEditorProps = {
  setRawMDXValue: (mdx: string) => void;
  getRawMDXValue: string;
};
const date = new Date();
export default function MDXEditor({
  getRawMDXValue,
  setRawMDXValue,
}: MDXEditorProps) {
  const { data: session } = useSession();
  const radioId = useId();
  const post: PostDataProps = {
    id: "1",
    content: getRawMDXValue,
    createdAt: date,
    updatedAt: date,
    reactions: [],
    author: {
      id: "",
      nickname: session?.user.name || "Cirno",
      profileImage: session?.user.image || "/images/placeholder.png",
      role: "USER",
      createdAt: date,
      karma: 999,
      _count: {
        posts: 9,
      },
    },
  };
  return (
    <div className="w-full">
      <div role="tablist" className="tabs tabs-lifted">
        <input
          type="radio"
          name={radioId}
          role="tab"
          className="tab"
          aria-label="Pisz"
          defaultChecked
        />
        <div
          role="tabpanel"
          className="tab-content rounded-box border-base-300 bg-base-200 p-2"
        >
          <UserInput
            onChange={(e) => {
              setRawMDXValue(e.target.value);
            }}
            value={getRawMDXValue}
          />
        </div>
        <input
          type="radio"
          name={radioId}
          role="tab"
          className="tab"
          aria-label="Podgląd"
        />
        <div
          role="tabpanel"
          className="tab-content rounded-box border-base-300 bg-base-200"
        >
          <PreviewMDXComment post={post} />
        </div>
        <input
          type="radio"
          name={radioId}
          role="tab"
          className="tab"
          aria-label="Podział"
        />
        <div
          role="tabpanel"
          className="tab-content rounded-box border-base-300 bg-base-200"
        >
          <div className="p-2">
            <UserInput
              onChange={(e) => {
                setRawMDXValue(e.target.value);
              }}
              value={getRawMDXValue}
            />
          </div>
          <PreviewMDXComment post={post} />
        </div>
      </div>
    </div>
  );
}

type UserInputProps = {
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  value: string;
};

const UserInput = ({ onChange, value }: UserInputProps) => {
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const handleCursorChange = (
    e:
      | React.MouseEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const insertText = (insertedText: string) => {
    if (cursorPosition !== null) {
      const before = value.slice(0, cursorPosition);
      const after = value.slice(cursorPosition);

      const newText = before + insertedText + after;

      onChange({
        ...({ target: { value: newText } } as ChangeEvent<HTMLTextAreaElement>),
      });

      const newCursorPosition = cursorPosition + insertedText.length;
      setCursorPosition(newCursorPosition);
    }
  };

  return (
    <div className="relative size-full">
      <textarea
        onChange={onChange}
        onClick={handleCursorChange}
        onKeyUp={handleCursorChange}
        value={value}
        className="textarea size-full min-h-32 rounded-box border-base-300"
      />
      <div className="dropdown dropdown-end dropdown-top absolute bottom-3 right-3">
        <FaRegFaceSmile
          className="size-5 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
          tabIndex={0}
          role="button"
        />
        <div
          tabIndex={0}
          className="card dropdown-content card-compact z-10 items-center justify-center bg-base-300 shadow"
        >
          <div className="flex p-1">
            {Object.keys(emoticons).map((e) => (
              <div
                key={e}
                onClick={() => insertText(`:${e}:`)}
                className="size-10 cursor-pointer rounded-full p-2 transition-all hover:bg-base-100"
              >
                <Emoticon src={emoticons[e]} alt={e} className="size-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
type PreviewMDXProps = {
  post: PostDataProps;
};
const PreviewMDXComment = ({ post }: PreviewMDXProps) => {
  return (
    <div className="pointer-events-none">
      <PostCard post={post} renderer={MDXRenderer} hideReply={true} />
    </div>
  );
};