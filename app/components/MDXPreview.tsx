import { PostDataProps } from "../types/prismaTypes";
import PostCard from "./forumComponents/PostCard";
import TopicListCard from "./forumComponents/TopicListCard";
import MDXRenderer from "./MDXRenderer";

export function PreviewDescription({ post }: { post: PostDataProps }) {
  return (
    <div className="max-h-72 flex-1 overflow-hidden p-2 lg:p-4">
      <MDXRenderer markdown={post.content} />
    </div>
  );
}
export function PreviewBlog({ post }: { post: PostDataProps }) {
  return (
    <PostCard
      post={post}
      isBlog
      renderer={MDXRenderer}
      hideReply={true}
      hideReactions={true}
    />
  );
}

export function PreviewPost({ post }: { post: PostDataProps }) {
  return (
    <>
      <div className="pointer-events-none">
        <TopicListCard
          slug={""}
          category={""}
          comments={[
            {
              author: {
                nickname: "CommenterUser",
                id: "",
              },
              createdAt: post.createdAt,
            },
          ]}
          {...post}
        />
        <div className="mb-5"></div>
        <PostCard
          post={post}
          renderer={MDXRenderer}
          hideReply={true}
          hideReactions={true}
        />
      </div>
    </>
  );
}
