"use client";

import { useSession } from "next-auth/react";
import { FaImage } from "react-icons/fa6";

export default function TakeTableSS() {
  const { data: session } = useSession();
  const takeSS = async () => {
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const profileTable = document.getElementById("profileTable");
      console.log(profileTable);
      if (!profileTable) return;
      const res = await html2canvas(profileTable, {
        allowTaint: true,
        useCORS: true,
        logging: true,
        windowWidth: 1200,
      });

      const dataURL = res.toDataURL();
      const a = document.createElement("a");
      a.href = dataURL;
      const date = Date.now();
      a.download = `Table-${session?.user.name}.png`;
      a.click();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <span
      onClick={takeSS}
      className="absolute right-4 top-4 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-80"
    >
      <FaImage />
    </span>
  );
}
