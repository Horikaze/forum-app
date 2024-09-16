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
  onImageChangeFile?: (file: File) => void;
};

export default function ChangeImage({
  children,
  aspect,
  target,
  onImageChange,
  onImageChangeFile,
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
        if (onImageChangeFile) {
          onImageChangeFile(croppedImage);
        }
        return;
      }
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [croppedImage]);

  const onCloseModal = () => {
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
      if (!target || onImageChange) return;
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
      <dialog ref={ref} className="modal" onClose={onCloseModal}>
        <div className="modal-box flex w-full max-w-6xl flex-col items-center gap-2">
          <div className="w-full max-w-2xl">
            <ImageCropper aspect={aspect} onCropChange={setCroppedImage} />
          </div>
          {croppedImageUrl && !onImageChange ? (
            <div className="mx-auto my-4 w-full max-w-2xl">
              <img
                src={croppedImageUrl}
                alt="Podgląd przyciętego obrazu"
                className="h-auto w-full rounded-box object-cover"
              />
            </div>
          ) : null}
          <div className="flex justify-center gap-2 self-end">
            <form method="dialog">
              <button className="btn btn-ghost">Zamknij</button>
            </form>
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
