"use client";

import Image from "next/image";

export default function Testing() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <div className="flex w-full rounded-box">
        <div className="w-52 shrink-0 bg-secondary"></div>
        <div className="h-64 w-full bg-primary">
          {/* <Image
            src={"/files/testBanner.jpg"}
            fill
            alt="preview"
            className="h-auto w-full"
          /> */}
        </div>
      </div>
    </div>
  );
}
