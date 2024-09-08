"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaPen, FaRegImage } from "react-icons/fa6";
const ChangeSignatureDynamic = dynamic(
  () => import("./ChangeSignatureDynamic"),
);
export default function ChangeSignature({ signature }: { signature: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <span
        onClick={() => setIsOpen((p) => !p)}
        className="absolute right-0 top-0 cursor-pointer opacity-0 transition-all hover:text-accent group-hover:opacity-100"
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
