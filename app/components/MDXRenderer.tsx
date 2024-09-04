import { useMDXComponents as MDXComponents } from "@/mdx-components";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
export default function MDXRenderer({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm], [remarkUnwrapImages]]}
      rehypePlugins={[rehypeRaw] as any}
      remarkRehypeOptions={{
        allowDangerousHtml: true,
      }}
      className={"prose max-w-none"}
      // @ts-ignore
      components={MDXComponents()}
    >
      {markdown}
    </ReactMarkdown>
  );
}
