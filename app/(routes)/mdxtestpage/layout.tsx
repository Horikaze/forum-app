export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose sm:prose-sm lg:prose-lg xl:prose-xl container px-1 py-2">
      {children}
    </div>
  );
}
