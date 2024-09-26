"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";
import {
  changeProfileImageAction,
  removeProfileImageAction,
} from "../profileActions";
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
        return;
      }
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [croppedImage]);

  const onCloseModal = () => {
    if (onImageChange && croppedImageUrl && croppedImage) {
      onImageChange(croppedImageUrl);
      if (onImageChangeFile) {
        onImageChangeFile(croppedImage);
      }
      return;
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
  const deleteImage = async () => {
    try {
      const res = await removeProfileImageAction(target!);
      if (!res.success) throw new Error(res.message);
      if (target === "profileImage") {
        update({ profileImage: "delete" });
      }
      if (ref.current) {
        ref.current.close();
      }
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <dialog ref={ref} className="modal" onClose={onCloseModal}>
        <div className="modal-box flex max-w-6xl flex-col items-center gap-2">
          <div className="flex w-full max-w-2xl flex-col gap-2">
            <ImageCropper aspect={aspect} onCropChange={setCroppedImage} />
            {croppedImageUrl && !onImageChange ? (
              <div className="flex justify-center">
                <img
                  src={croppedImageUrl}
                  alt="Podgląd przyciętego obrazu"
                  className="h-auto w-full max-w-sm rounded-box object-cover"
                />
              </div>
            ) : null}
          </div>
          <div className="flex w-full justify-end gap-2">
            {target ? (
              <button onClick={deleteImage} className="btn btn-warning mr-auto">
                Usuń obrazek
              </button>
            ) : null}
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
                  <span className="loading loading-spinner" />
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
