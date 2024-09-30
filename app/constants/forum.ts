import { FaCheck } from "react-icons/fa";

export const forumCategory = [
  {
    title: "Touhou",
    dbTarget: "touhou",
    summary: "Na wszystkie rzeczy związane z touhou",
  },
  {
    title: "Nowości",
    dbTarget: "news",
    summary: "Na nowości w świecie touhou i nie tylko",
  },
  {
    title: "Twórczość Własna",
    dbTarget: "creative",
    summary: "Na wasze kreatywne rzeczy",
  },
  {
    title: "Misty Lake",
    dbTarget: "others",
    summary: "Na wszytko inne",
  },
  {
    title: "Blog",
    dbTarget: "blog",
    summary: "Blog",
  },
  {
    title: "Poradniki",
    dbTarget: "guides",
    summary: "Poradniki",
  },
];
export const userForumDb = forumCategory.slice(0, 4);
export const adminForumDb = forumCategory.slice(4);

export const validFileExtensions = [".png", ".gif", ".jpeg", ".jpg"];

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export enum LoginProvider {
  DISCORD = "discord",
  GITHUB = "github",
  CREDENTIALS = "credentials",
}
export enum UserRole {
  USER = "user",
  BLOCKED = "blocked",
  SUPPORTER = "supporter",
  MODERATOR = "moderator",
  ADMIN = "admin",
}
export enum RequestStatus {
  PENDING = "pending",
  REJECTED = "rejected",
  APPROVED = "approved",
}
export const requestCategory = [
  {
    title: "Osiągnięcie",
    target: "achievement",
    summary:
      "Jeżeli chcesz otrzymać osiągnięcie, napisz tu jakie ma ID i podaj za co. Możesz podać kilka na raz.",
  },
  {
    title: "Powtórki",
    target: "replay",
    summary: "Jeżeli masz jakies zastrzerzenia do powtórki/rankingu",
  },
  {
    title: "Forum",
    target: "forum",
    summary:
      "Jeżeli masz jakies zastrzerzenia do forum, bugi, coś nie działa etc. Wciąż lepiej napisac na discordzie :)",
  },
  {
    title: "Inne",
    target: "other",
    summary: "Na wszystko inne",
  },
];
