import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import React from "react";
import { emoticons } from "./app/constants/emotes";
import { cn } from "./app/utils/twUtils";
import toast from "react-hot-toast";
type EmoticonProps = {
  src: string;
  alt?: string;
  className?: string;
};

export const Emoticon = ({ src, alt, className }: EmoticonProps) => (
  <span data-tip={`:${alt}:`} className="tooltip cursor-pointer">
    <Image
      src={src}
      alt={`:${alt}:` || "emote"}
      width={50}
      height={50}
      className={cn("emote !m-0 inline size-[1.2em] align-middle", className)}
      priority
    />
  </span>
);

export function EmoticonWrapper(props: any): JSX.Element {
  const processText = (text: string) => {
    const parts = text.split(/(:\w+:)/g);
    return parts.map((part, index) => {
      if (part.startsWith(":") && part.endsWith(":")) {
        const emoji = part.slice(1, -1);
        if (emoji in emoticons) {
          return <Emoticon key={index} src={emoticons[emoji]} alt={emoji} />;
        }
      }
      return part;
    });
  };

  const modifiedChildren = React.Children.map(props.children, (child) => {
    if (typeof child === "string") {
      return processText(child);
    }
    return child;
  });

  return modifiedChildren;
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...components,
    p(props) {
      return <p {...props}>{EmoticonWrapper(props)}</p>;
    },
    span(props) {
      return <span {...props}>{EmoticonWrapper(props)}</span>;
    },
    h1(props) {
      return <h1 {...props}>{EmoticonWrapper(props)}</h1>;
    },
    h2(props) {
      return <h2 {...props}>{EmoticonWrapper(props)}</h2>;
    },
    h3(props) {
      return <h3 {...props}>{EmoticonWrapper(props)}</h3>;
    },
    h4(props) {
      return <h4 {...props}>{EmoticonWrapper(props)}</h4>;
    },
    h5(props) {
      return <h5 {...props}>{EmoticonWrapper(props)}</h5>;
    },
    li(props) {
      return <li {...props}>{EmoticonWrapper(props)}</li>;
    },
    img: (props) => {
      console.log(props);
      const imageName = props.src?.split("/").pop();
      if (!props.src) return;
      return (
        <img
          alt={imageName!}
          {...props}
          loading="lazy"
          className={cn(props.className!, "rounded-md")}
        />
      );
    },
  };
}
