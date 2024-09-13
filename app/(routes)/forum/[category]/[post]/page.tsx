import PostCard from "@/app/components/forumComponents/PostCard";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import SSRMDXRenderer from "../../../../components/SSRMDXRenderer";
import AddComment from "../../../../components/forumComponents/AddComment";
type Props = {
  params: { post: string };
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const post = await db.post.findFirst({
    where: {
      slug: params.post,
    },
    select: {
      title: true,
      subTitle: true,
      category: true,
      author: {
        select: {
          nickname: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });
  if (!post) {
    return {
      title: "Nie znaleziono",
    };
  }
  return {
    title: post.title,
    description: post.subTitle || `Post ${post.author.nickname}`,
    creator: post.author.nickname,
    category: post.category,
    openGraph: {
      title: post.title,
      description: post.subTitle || `Post ${post.author.nickname}`,
      type: "article",
      authors: [post.author.nickname],
      siteName: "Gensokyawka",
      images: {
        url: `/api/embeddedimage?comments=${post._count.comments}&reactions=${post._count.reactions}&nickname=${post.author.nickname}&profileImage=${post.author.profileImage || ""}&title=${encodeURIComponent(post.title)}&subTitle=${encodeURIComponent(post.subTitle || "")}`,
        width: 1200,
        height: 600,
        alt: post.title,
      },
    },
  };
}

export default async function PostPage({ params }: Props) {
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
        orderBy: {
          createdAt: "asc",
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
          //@ts-ignore we have additional title, subTitle
          post={c}
          renderer={SSRMDXRenderer}
          //@ts-ignore we have additional title, subTitle
          replays={c.replies}
          currentUserId={session?.user.id}
        />
      ))}
      <AddComment postId={post.id} />
    </div>
  );
}
