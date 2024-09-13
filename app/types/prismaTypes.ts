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
    title?: true;
    subTitle?: true;
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
