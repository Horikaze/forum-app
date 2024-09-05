import { forumCategory } from "@/app/constants/forum";

import {
  LoginProvider,
  PostStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import { faker } from "@faker-js/faker"; // Ensure the correct import

const db = new PrismaClient();

async function createRandomUser() {
  const nickname = faker.internet.userName(); // Use faker correctly
  const hashedPassword = faker.internet.password();
  const role = faker.helpers.arrayElement([
    "USER",
    "BLOCKED",
    "SUPPORTER",
    "MODERATOR",
    "ADMIN",
  ]) as UserRole;
  const loginProvider = faker.helpers.arrayElement([
    "DISCORD",
    "GITHUB",
    "CREDENTIALS",
  ]) as LoginProvider;

  const user = await db.user.create({
    data: {
      nickname,
      role,
      profileImage: "https://api.api-ninjas.com/v1/randomimage?category=nature",
      account: {
        create: {
          hashedPassword,
          loginProvider,
        },
      },
    },
  });

  // Create random number of posts for the user
  const numberOfPosts = faker.number.int({ min: 1, max: 5 });
  for (let i = 0; i < numberOfPosts; i++) {
    await createRandomPost(user.id);
  }

  return user;
}

async function createRandomPost(authorId: string) {
  const title = faker.lorem.sentence();
  const slug = faker.lorem.slug();
  const subTitle = faker.lorem.sentence();
  const content = faker.lorem.paragraphs(3);
  const tags = faker.lorem.words(3).split(" ");
  const category = faker.helpers.arrayElement(
    forumCategory.map((c) => c.dbTarget),
  );
  const status = faker.helpers.arrayElement([
    "DRAFT",
    "PUBLISHED",
  ]) as PostStatus;

  const post = await db.post.create({
    data: {
      title,
      slug,
      subTitle,
      content,
      tags,
      category,
      status,
      author: {
        connect: { id: authorId },
      },
    },
  });

  return post;
}

async function main() {
  const numberOfUsers = 10; // Specify how many users you want to create

  for (let i = 0; i < numberOfUsers; i++) {
    await createRandomUser();
  }

  console.log("Random users and posts have been created!");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
