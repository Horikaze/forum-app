export default function ForumLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-3 overflow-y-auto">
      <div className="container size-full">{children}</div>
    </div>
  );
}
