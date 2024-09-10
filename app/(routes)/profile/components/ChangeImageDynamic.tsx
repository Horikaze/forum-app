import ImageCropper from "@/app/components/ImageCropper";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type ChangeImageDynamicProps = {
  isOpen: boolean;
  onClose: () => void;
  callback: (croppedImage: File | null) => Promise<{
    success: boolean;
    message: string;
  }>;
  aspect: number;
};

export default function ChangeImageDynamic({
  isOpen,
  onClose,
  callback,
  aspect,
}: ChangeImageDynamicProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
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
    setIsPending(true);
    try {
      const res = await callback(croppedImage!);
      if (!res.success) throw new Error(`${res.message}`);
      ref.current!.close();
    } catch (error) {
      toast.error(`${error}`);
      ref.current!.close();
    } finally {
      setIsPending(false);
    }
  };
  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={() => {
        handleBackdropClick();
      }}
    >
      <div className="modal-box flex w-full max-w-7xl flex-col items-end gap-2">
        <span className="self-start font-semibold">
          Zmień profilowe / banner
        </span>
        <div className="size-full">
          <ImageCropper aspect={aspect} onCropChange={setCroppedImage} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={handleBackdropClick}>
            Anuluj
          </button>
          <button
            disabled={isPending}
            className="btn btn-primary"
            onClick={() => changeImage()}
          >
            {isPending ? (
              <span className="loading loading-spinner"></span>
            ) : null}
            Zapisz
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button />
      </form>
    </dialog>
  );
}
