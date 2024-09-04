import NewPostComponent from "./NewPostComponent";

export default async function NewPost({
  searchParams,
}: {
  searchParams: { forumTarget: string };
}) {
  return (
    <NewPostComponent
      forumTarget={searchParams.forumTarget}
    />
  );
}
