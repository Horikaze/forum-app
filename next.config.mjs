import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkUnwrapImages from "remark-unwrap-images";
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    reactCompiler: true,
    mdxRs: {
      mdxType: "gfm",
    },
    ppr: "incremental",
  },
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: "bottom-right",
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["next-mdx-remote"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkUnwrapImages, remarkRehype],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
