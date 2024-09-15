"use client";

import { useState } from "react";
import { cn } from "../utils/twUtils";
import { fa } from "@faker-js/faker";
import { FaArrowLeft } from "react-icons/fa6";

export default function RecentPanelController({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <aside
      className={cn(
        "sticky top-0 hidden transition-all lg:flex",
        isOpen ? "w-[430px]" : "w-5",
      )}
    >
      <div
        role="button"
        onClick={() => setIsOpen((p) => !p)}
        className="mr-1 flex h-full w-5 shrink-0 cursor-pointer flex-col items-center justify-center rounded-box bg-transparent transition-all hover:bg-base-200/60"
      >
        <FaArrowLeft
          className={cn(
            "z-30 size-3 transition-all group-hover:opacity-80",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </div>
      <div className="w-full overflow-x-hidden">{children}</div>
    </aside>
  );
}
