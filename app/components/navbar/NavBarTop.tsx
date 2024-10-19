"use client";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import NavNavigator from "./NavNavigator";
import { usePathname } from "next/navigation";
import { UserRole } from "@/app/constants/forum";
export default function NavBarTop() {
  const { data: session, status } = useSession();
  return (
    <nav className="z-20 flex h-16 w-full items-center border-b border-base-300 bg-base-200">
      <NavNavigator />
      <div className="ml-auto flex h-16 flex-shrink-0 items-center gap-2 p-2">
        {status === "loading" ? (
          <button className="btn" disabled>
            Ładowanie...
          </button>
        ) : (
          <>
            {session ? (
              <DropdownMenu
                session={session}
                isAdmin={
                  session!.user.role === UserRole.ADMIN ||
                  session!.user.role === UserRole.MODERATOR
                }
              />
            ) : (
              <LoginButton />
            )}
          </>
        )}
      </div>
    </nav>
  );
}
const LoginButton = () => {
  const pathname = usePathname();
  return (
    <Link href={`/login?redirectTo=${pathname}`} className="btn">
      Zaloguj
    </Link>
  );
};
type DropdownMenuProps = {
  session: Session;
  isAdmin?: boolean;
};
const DropdownMenu = ({ session, isAdmin }: DropdownMenuProps) => {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="avatar btn btn-ghost">
        <span className="font-semibold">{session.user.name}</span>
        <div className="size-10 rounded-full bg-primary">
          <Image
            src={session?.user.image || "/images/placeholder.png"}
            alt={session.user.name || "profile image"}
            width="0"
            height="0"
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content menu-sm z-20 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow"
      >
        <li>
          <Link
            href={`/profile/${session.user.id}`}
            className="justify-between"
          >
            Profil
          </Link>
        </li>
        {isAdmin ? (
          <li>
            <Link href={"/admin"}>Moderowanie</Link>
          </li>
        ) : null}
        <form
          action={async () => {
            await signOut();
          }}
          className="form-control"
        >
          <button type="submit" className="btn btn-warning btn-sm mt-3">
            Wyloguj
          </button>
        </form>
      </ul>
    </div>
  );
};
