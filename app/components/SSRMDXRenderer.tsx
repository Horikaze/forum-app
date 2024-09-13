import { useMDXComponents as MDXComponents } from "@/mdx-components";
import React from "react";
import * as prod from "react/jsx-runtime";
import rehypeRaw from "rehype-raw";
import rehypeReact from "rehype-react";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import { cn } from "../utils/twUtils";

const createSchema = (disableLinks: boolean) => {
  const schema = {
    ...defaultSchema,
    attributes: {
      "*": ["className", "src", "width", "checked"],
    },
  };
  if (disableLinks) {
    schema.tagNames = schema.tagNames?.filter((tag) => tag !== "a");
    // @ts-ignore
    delete schema.attributes?.a;
  }
  return schema;
};

const production = {
  createElement: React.createElement,
  Fragment: prod.Fragment,
  jsxs: prod.jsxs,
  jsx: prod.jsx,
  components: MDXComponents(),
};

export default async function SSRMDXRenderer({
  markdown,
  isPreview = false,
}: {
  markdown: string;
  isPreview?: boolean;
}) {
  const schema = createSchema(isPreview);

  const file = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(remarkGfm)
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    //@ts-ignore
    .use(rehypeReact, production)
    .process(markdown);

  return (
    <div
      className={cn(
        "max-w-none [overflow-wrap:anywhere]",
        isPreview ? "" : "prose",
      )}
    >
      {file.result}
    </div>
  );
}
