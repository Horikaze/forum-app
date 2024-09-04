export default function ForumLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return <div className="container p-3">{children}</div>;
}
