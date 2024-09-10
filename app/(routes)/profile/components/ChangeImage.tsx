"use client";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { changeProfileImageAction } from "../profileActions";
const ChangeImageDynamic = dynamic(() => import("./ChangeImageDynamic"));
type ChangeImageProps = {
  children: React.ReactNode;
  aspect: number;
  target: "bannerImage" | "profileImage";
};
export default function ChangeImage({
  children,
  aspect,
  target,
}: ChangeImageProps) {
  const { update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const changeImage = async (file: File | null) => {
    const res = await changeProfileImageAction(file!, target);
    if (target === "profileImage") {
      update({ profileImage: res.message });
    }
    return res;
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      {isOpen && (
        <ChangeImageDynamic
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          callback={changeImage}
          aspect={aspect}
        />
      )}
    </>
  );
}
