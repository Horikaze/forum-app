import MDXEditor from "@/app/components/MDXEditor";
import { PreviewDescription } from "@/app/components/MDXPreview";
import { PostImage } from "@/app/types/types";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { changeDescriptionAction } from "../profileActions";

type ChangeSignatureDynamicProps = {
  isOpen: boolean;
  onClose: () => void;
  description?:string
};

export default function ChangeDescriptionDynamic({
  isOpen,
  onClose,
  description
}: ChangeSignatureDynamicProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [inputValue, setInputValue] = useState(description || "");
  const [isPending, setIsPending] = useState(false);
  const [images, setImages] = useState<PostImage[]>([]);
  useEffect(() => {
    if (isOpen && ref.current) {
      ref.current.showModal();
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    ref.current!.close();
    onClose();
  };

  const changeDescription = async () => {
    console.log(inputValue.length);
    try {
      const res = await changeDescriptionAction(inputValue);
      if (!res.success) throw new Error(`${res.message}`);
      ref.current?.close();
    } catch (error) {
      console.log(error);
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <dialog ref={ref} className="modal" onClose={handleBackdropClick}>
      <div className="modal-box flex w-full max-w-5xl flex-col items-end gap-2">
        <span className="self-start font-semibold">Zmień opis</span>
        <MDXEditor
             mdxContent={[inputValue, setInputValue]}
             postImages={[images, setImages]}
          preview={PreviewDescription}
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              ref.current?.close();
            }}
            className="btn btn-ghost"
          >
            Anuluj
          </button>
          <button
            onClick={changeDescription}
            disabled={isPending}
            className="btn btn-primary"
          >
            {isPending ? <span className="loading loading-spinner" /> : null}
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
