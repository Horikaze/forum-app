"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { FaRegImage } from "react-icons/fa6";
const ChangeAvatarDynamic = dynamic(() => import("./ChangeAvatarDynamic"));
export default function ChangeAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center bg-base-300/50 opacity-0 backdrop-blur-sm transition-all group-hover/fpf:opacity-100">
        <FaRegImage
          onClick={() => setIsOpen(true)}
          className="size-8 cursor-pointer text-accent"
        />
      </div>
      {isOpen && (
        <ChangeAvatarDynamic isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
