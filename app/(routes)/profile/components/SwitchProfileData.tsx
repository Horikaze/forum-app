"use client";
import { usePathname, useRouter } from "next/navigation";
import { FaList, FaUser } from "react-icons/fa6";

export default function SwitchProfileData() {
  const pathname = usePathname();
  const router = useRouter();
  const changeRoute = () => {
    router.push(pathname === "/profile" ? "/profile/data" : "/profile");
  };

  return (
    <div className="my-1 flex items-center justify-center gap-2">
      <FaUser className="size-5" />
      <input
        onChange={changeRoute}
        checked={pathname === "/profile" ? false : true}
        type="checkbox"
        className="toggle bg-base-content hover:bg-base-content"
      />
      <FaList className="size-5" />
    </div>
  );
}
