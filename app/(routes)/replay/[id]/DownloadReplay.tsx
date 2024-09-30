"use client";
import React from "react";
import { FaDownload } from "react-icons/fa6";
type DownloadReplayProps = {
  data: string;
  rpy_name: string;
};
export default function DownloadReplay({
  data,
  rpy_name,
}: DownloadReplayProps) {
  const downdloadRpy = () => {
    const uint8Array = Uint8Array.from(Buffer.from(data, "base64"));
    const blob = new Blob([uint8Array]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = rpy_name;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <FaDownload
      onClick={downdloadRpy}
      className="cursor-pointer opacity-80 transition-all hover:opacity-100"
    />
  );
}
