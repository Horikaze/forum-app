import ImageCropper from "@/app/components/ImageCropper";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { changeProfileImageAction } from "../profileActions";
import { useSession } from "next-auth/react";
import MDXEditor from "@/app/components/MDXEditor";

type ChangeSignatureDynamicProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangeSignatureDynamic({
  isOpen,
  onClose,
}: ChangeSignatureDynamicProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { data: session, status, update } = useSession();
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    if (isOpen && ref.current) {
      ref.current.showModal();
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    ref.current!.close();
    onClose();
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
        <span className="self-start font-semibold">Zmień podpis</span>
        <MDXEditor setRawMDXValue={setInputValue} getRawMDXValue={inputValue} />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button />
      </form>
    </dialog>
  );
}
