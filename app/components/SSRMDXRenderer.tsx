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
const scheama = {
  ...defaultSchema,
  attributes: {
    "*": ["className", "src", "width", "checked"],
  },
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
}: {
  markdown: string;
}) {
  const file = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(remarkGfm)
    .use(rehypeRaw)
    .use(rehypeSanitize, scheama)
    //@ts-ignore
    .use(rehypeReact, production)
    .process(markdown);
  return <div className="prose max-w-none">{file.result}</div>;
}
