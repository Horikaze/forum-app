import { ForumsCategory } from "@prisma/client";

export const forumCategory = [
  {
    title: "Touhou",
    dbTarget: ForumsCategory.TOUHOU,
    href: "touhou",
    summary: "Na wszystkie rzeczy związane z touhou",
  },
  {
    title: "Nowości",
    dbTarget: ForumsCategory.NEWS,
    href: "news",
    summary: "Na nowości w świecie touhou i nie tylko ",
  },
  {
    title: "Twórczość Własna",
    dbTarget: ForumsCategory.CREATIVE,
    href: "creative",
    summary: "Na wasze kreatywne rzeczy",
  },
  {
    title: "Misty Lake",
    dbTarget: ForumsCategory.OTHERS,
    href: "others",
    summary: "Na wszytko inne ",
  },
];
