"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHouse } from "react-icons/fa6";

export default function NavNavigator() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");
  if (pathSegments.length === 0) return null;
  return (
    <div className="breadcrumbs text-sm md:block hidden overflow-hidden w-full ml-16">
      <ul>
        <li key="home">
          <Link href="/">
            <FaHouse className="mr-2" />
            Home
          </Link>
        </li>
        {pathSegments.map((segment, idx) => {
          const href = `/${pathSegments.slice(0, idx + 1).join("/")}`;
          return (
            <li key={segment}>
              <Link href={href}>
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
