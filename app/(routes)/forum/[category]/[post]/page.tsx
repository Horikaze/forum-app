import PostCard from "@/app/components/forumComponents/PostCard";
import { auth } from "@/auth";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import SSRMDXRenderer from "../../../../components/SSRMDXRenderer";
import AddComment from "../../../../components/forumComponents/AddComment";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { ImageResponse } from "next/og";
import GETHandlerImage from "@/app/components/forumComponents/GETHandlerImage";
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
    openGraph: {
      title: post.title,
      description: post.subTitle || `Post ${post.author.nickname}`,
      type: "article",
      authors: [post.author.nickname],
    },
  };
}

export async function GET(request: Request, { params }: Props) {
  const post = await db.post.findFirst({
    where: {
      slug: params.post,
    },
    select: {
      title: true,
      subTitle: true,
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
  if (!post) return;
  return new ImageResponse(
    (
      <GETHandlerImage
        commentsCount={post._count.comments}
        likesCount={post._count.reactions}
        nickname={post.author.nickname}
        profileImage={
          post.author.profileImage ||
          `https://ui-avatars.com/api/?name=${post.author.nickname}`
        }
        title={post.title}
        subTitle={post.subTitle || ""}
      />
    ),
    {
      width: 1200,
      height: 600,
    },
  );
}

export default async function PostPage({ params }: Props) {
  const Post = async () => {
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
  };

  return (
    <Suspense fallback={PostLoadingSkeleton()}>
      <Post />
    </Suspense>
  );
}
const PostLoadingSkeleton = () => {
  const arr = [1, 2, 3];
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton h-5 w-1/2"></div>
      <div className="skeleton h-3 w-32"></div>
      {arr.map((i) => (
        <div
          key={i}
          className="mt-5 flex min-h-56 w-full flex-col gap-5 rounded-box bg-base-200 p-2 lg:flex-row lg:p-4"
        >
          <div className="flex w-52 flex-row gap-2 lg:flex-col lg:items-end">
            <div className="skeleton size-16 lg:size-24" />
            <div className="skeleton h-3 w-32"></div>
            <div className="skeleton hidden h-2 w-12 lg:block"></div>
            <div className="skeleton hidden h-2 w-24 lg:block"></div>
            <div className="skeleton hidden h-2 w-24 lg:block"></div>
            <div className="skeleton hidden h-2 w-44 lg:block"></div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-4/5"></div>
            <div className="skeleton h-4 w-52"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
