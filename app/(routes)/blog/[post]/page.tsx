import PostCard from "@/app/components/forumComponents/PostCard";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import SSRMDXRenderer from "../../../components/SSRMDXRenderer";
import AddComment from "../../../components/forumComponents/AddComment";
import { PostDataProps } from "@/app/types/prismaTypes";
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
      featuredImage: true,
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
        url: `/api/embeddedimage?slug=${params.post}`,
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
      _count: {
        select: {
          comments: true,
          reactions: true,
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
      <PostCard
        post={post}
        renderer={SSRMDXRenderer}
        hideReply={true}
        isPost
        isBlog
        currentUserId={session?.user.id}
      />
      {post.comments.map((c) => (
        <PostCard
          key={c.id}
          post={c as any as PostDataProps}
          renderer={SSRMDXRenderer}
          //@ts-ignore we have additional title, subTitle
          replays={c.replies as any as PostDataProps}
          currentUserId={session?.user.id}
        />
      ))}
      <AddComment postId={post.id} />
    </div>
  );
}
