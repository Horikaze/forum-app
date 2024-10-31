import { Prisma } from "@prisma/client";

export type TopicListProp = Prisma.PostGetPayload<{
  select: {
    title: true;
    subTitle: true;
    createdAt: true;
    slug: true;
    category: true;
    _count: {
      select: {
        comments: true;
        reactions: true;
      };
    };
    author: {
      select: {
        nickname: true;
        id: true;
      };
    };
    comments: {
      take: 1;
      select: {
        author: {
          select: {
            nickname: true;
            id: true;
          };
        };
        createdAt: true;
      };
    };
  };
}>;
export type PostDataProps = Prisma.PostGetPayload<{
  select: {
    content: true;
    createdAt: true;
    updatedAt: true;
    id: true;
    title: true;
    subTitle: true;
    featuredImage: true;
    images: true;
    _count: {
      select: {
        comments: true;
        reactions: true;
      };
    };
    reactions: {
      include: {
        user: {
          select: {
            nickname: true;
          };
        };
      };
    };
    author: {
      select: {
        nickname: true;
        profileImage: true;
        role: true;
        createdAt: true;
        karma: true;
        id: true;
        _count: {
          select: {
            posts: true;
          };
        };
      };
    };
  };
}>;

export type RecentComment = Prisma.PostCommentGetPayload<{
  select: {
    author: { select: { nickname: true } };
    content: true;
    id: true;
    createdAt: true;
    post: {
      select: {
        slug: true;
        category: true;
        title: true;
      };
    };
    parentComment: {
      select: {
        post: {
          select: {
            slug: true;
            category: true;
            title: true;
          };
        };
      };
    };
  };
}>;
export type RecentReplay = Prisma.ReplayGetPayload<{
  select: {
    character: true;
    shotType: true;
    score: true;
    game: true;
    replayId: true;
    achievement: true;
    createdAt: true;
    profile: {
      select: {
        nickname: true;
      };
    };
  };
}>;
export type RecentPost = Prisma.PostGetPayload<{
  select: {
    author: { select: { nickname: true } };
    category: true;
    slug: true;
    subTitle: true;
    title: true;
    featuredImage: true;
    createdAt: true;
  };
}>;
export type RecentAchievement = Prisma.AchievementGetPayload<{
  include: {
    user: {
      select: {
        nickname: true;
      };
    };
  };
}>;
export type UserProfile = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        comments: true;
        posts: true;
      };
    };
    table: true;
    replay: true;
  };
}>;
