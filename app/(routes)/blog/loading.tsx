import React from "react";

export default function loading() {
  const arr = [1, 2, 3];
  return (
    <div className="flex flex-col gap-5">
      {arr.map((i) => (
        <div className="skeleton aspect-[3/1] w-full rounded-box" key={i}></div>
      ))}
    </div>
  );
}
