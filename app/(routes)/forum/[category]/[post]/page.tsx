import PostCard from "@/app/components/forumComponents/PostCard";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import SSRMDXRenderer from "../../../../components/SSRMDXRenderer";
import AddComment from "../../../../components/forumComponents/AddComment";
import { auth } from "@/auth";

export default async function PostPage({
  params,
}: {
  params: { post: string };
}) {
  const post = await db.post.findFirst({
    relationLoadStrategy: "join",
    where: {
      slug: params.post,
    },
    include: {
      reactions: {
        include: {
          user: {
            select: {
              nickname: true,
            },
          },
        },
      },
      author: {
        select: {
          nickname: true,
          profileImage: true,
          role: true,
          createdAt: true,
          karma: true,
          id: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      },
      comments: {
        include: {
          reactions: {
            include: {
              user: {
                select: {
                  nickname: true,
                },
              },
            },
          },
          author: {
            select: {
              nickname: true,
              profileImage: true,
              role: true,
              createdAt: true,
              karma: true,
              id: true,
              _count: {
                select: {
                  posts: true,
                },
              },
            },
          },
          replies: {
            include: {
              reactions: {
                include: {
                  user: {
                    select: {
                      nickname: true,
                    },
                  },
                },
              },
              author: {
                select: {
                  nickname: true,
                  profileImage: true,
                  role: true,
                  createdAt: true,
                  karma: true,
                  id: true,
                  _count: {
                    select: {
                      posts: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!post) return notFound();
  const session = await auth();
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold">{post.title}</h2>
      {post.subTitle ? (
        <p className="text-sm opacity-80">{post.subTitle}</p>
      ) : null}
      <PostCard
        post={post}
        renderer={SSRMDXRenderer}
        hideReply={true}
        isPost
        currentUserId={session?.user.id}
      />
      {post.comments.map((c) => (
        <PostCard
          key={c.id}
          post={c}
          renderer={SSRMDXRenderer}
          replays={c.replies}
          currentUserId={session?.user.id}
        />
      ))}
      <AddComment postId={post.id} />
    </div>
  );
}
