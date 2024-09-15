"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";
import { changeProfileImageAction } from "../profileActions";
import ImageCropper from "@/app/components/ImageCropper";
import toast from "react-hot-toast";

type ChangeImageProps = {
  children: React.ReactNode;
  aspect: number;
  target?: "bannerImage" | "profileImage";
  onImageChange?: (url: string) => void;
};

export default function ChangeImage({
  children,
  aspect,
  target,
  onImageChange,
}: ChangeImageProps) {
  const { update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && ref.current) {
      ref.current.showModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (croppedImage) {
      const url = URL.createObjectURL(croppedImage);
      setCroppedImageUrl(url);
      if (onImageChange) {
        onImageChange(url);
        return;
      }
      URL.revokeObjectURL(url);
    }
  }, [croppedImage]);

  const handleBackdropClick = () => {
    if (ref.current) {
      ref.current.close();
    }
    setIsOpen(false);
    setCroppedImage(null);
    setCroppedImageUrl(null);
  };

  const changeImage = async () => {
    if (!croppedImage) {
      toast.error("Nie wybrano pliku");
      return;
    }

    setIsPending(true);
    try {
      // we dont send instantly to server
      if (onImageChange) return;
      if (!target) return;
      const res = await changeProfileImageAction(croppedImage, target);
      if (!res.success) throw new Error(res.message);

      if (target === "profileImage") {
        update({ profileImage: res.message });
      }
      if (ref.current) {
        ref.current.close();
      }
      setIsOpen(false);
      setCroppedImage(null);
      setCroppedImageUrl(null);
    } catch (error) {
      toast.error(`${error}`);
      if (ref.current) {
        ref.current.close();
      }
      setIsOpen(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <dialog ref={ref} className="modal" onClose={handleBackdropClick}>
        <div className="modal-box flex w-full max-w-7xl flex-col items-end gap-2">
          <div className="size-full">
            <ImageCropper aspect={aspect} onCropChange={setCroppedImage} />
          </div>
          {croppedImageUrl && !onImageChange ? (
            <div className="mx-auto my-4 w-full max-w-xs">
              <img
                src={croppedImageUrl}
                alt="Podgląd przyciętego obrazu"
                className="h-auto w-full rounded-box object-cover"
              />
            </div>
          ) : null}
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={handleBackdropClick}>
              Zamknij
            </button>
            {!onImageChange && (
              <button
                disabled={isPending}
                className="btn btn-primary"
                onClick={changeImage}
              >
                {isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : null}
                Zapisz
              </button>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button />
        </form>
      </dialog>
    </>
  );
}
