import ImageCropper from "@/app/components/ImageCropper";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { changeProfileImageAction } from "../profileActions";
import { useSession } from "next-auth/react";

type ChangeAvatarDynamicProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangeAvatarDynamic({
  isOpen,
  onClose,
}: ChangeAvatarDynamicProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { data: session, status, update } = useSession();
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  useEffect(() => {
    if (isOpen && ref.current) {
      ref.current.showModal();
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    ref.current!.close();
    onClose();
  };
  const changeImage = async () => {
    const res = await changeProfileImageAction(croppedImage!);
    if (!res.success) {
      toast.error(`${res.message}`);
      ref.current!.close();
      return;
    }
    update({ profileImage: res.message });
    ref.current!.close();
  };
  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={() => {
        handleBackdropClick();
      }}
    >
      <div className="modal-box flex w-full max-w-5xl flex-col items-end gap-2">
        <span className="self-start font-semibold">Zmień avatar</span>
        <div className="size-full">
          <ImageCropper aspect={1} onCropChange={setCroppedImage} />
        </div>
        <button className="btn btn-primary" onClick={() => changeImage()}>
          Zapisz
        </button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button />
      </form>
    </dialog>
  );
}
