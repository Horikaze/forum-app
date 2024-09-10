"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPen, FaRegImage } from "react-icons/fa6";
const ChangeSignatureDynamic = dynamic(
  () => import("./ChangeDescriptionDynamic"),
);
export default function ChangeDescription({
  description,
}: {
  description: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <span
        onClick={() => setIsOpen((p) => !p)}
        className="absolute right-0 top-0 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-80"
      >
        <FaPen />
      </span>
      {isOpen && (
        <ChangeSignatureDynamic
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
