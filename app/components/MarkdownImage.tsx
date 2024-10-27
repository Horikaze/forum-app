"use client";
import React, { useRef } from "react";
import { cn } from "../utils/twUtils";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { FaLifeRing } from "react-icons/fa6";

export default function MarkdownImage({
  props,
}: {
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const imageName = props.src?.split("/").pop();
  const downloadImage = async () => {
    const response = await fetch(props.src!);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = imageName!;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  return (
    <>
      <img
        onClick={() => {
          ref.current?.showModal();
        }}
        alt={imageName!}
        {...props}
        loading="lazy"
        className={cn("cursor-pointer rounded-md", props.className!)}
      />
      <dialog ref={ref} className="modal">
        <div className="modal-box relative flex w-auto max-w-7xl items-center justify-center p-0">
          <img
            onClick={() => {
              ref.current?.showModal();
            }}
            alt={imageName!}
            src={props.src!}
            loading="lazy"
            className={cn("m-0 rounded-md")}
          />
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
            <a
              target="_blank"
              href={props.src}
              className="flex cursor-pointer items-center justify-center rounded-full bg-base-300 p-4 opacity-80 transition-all hover:opacity-100"
            >
              <FaExternalLinkAlt />
            </a>
            <div
              onClick={downloadImage}
              className="flex cursor-pointer items-center justify-center rounded-full bg-base-300 p-4 opacity-80 transition-all hover:opacity-100"
            >
              <FaDownload />
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
