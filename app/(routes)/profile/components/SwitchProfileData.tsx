"use client";
import { usePathname, useRouter } from "next/navigation";
import { FaList, FaUser } from "react-icons/fa6";

type SwitchProfileDataProps = {
  userId: string;
};

export default function SwitchProfileData({ userId }: SwitchProfileDataProps) {
  const pathname = usePathname();
  const router = useRouter();
  const changeRoute = () => {
    router.replace(
      !pathname.includes("moreinfo")
        ? `/profile/${userId}/moreinfo`
        : `/profile/${userId}`,
    );
  };

  return (
    <div className="my-1 flex items-center justify-center gap-2">
      <FaUser className="size-5" />
      <input
        onChange={changeRoute}
        checked={pathname.includes("moreinfo")}
        type="checkbox"
        className="toggle bg-base-content hover:bg-base-content"
      />
      <FaList className="size-5" />
    </div>
  );
}
