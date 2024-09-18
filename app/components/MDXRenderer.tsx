import { useMDXComponents as MDXComponents } from "@/mdx-components";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
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
      className={"prose max-w-none [overflow-wrap:anywhere]"}
      // @ts-ignore
      components={MDXComponents()}
      urlTransform={(e) => {
        if (e.startsWith("blob")) return e;
        return defaultUrlTransform(e);
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
