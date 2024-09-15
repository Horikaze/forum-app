import React from "react";

export default function loading() {
  const arr = [1, 2, 3];
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton h-5 w-1/2"></div>
      <div className="skeleton h-3 w-32"></div>
      {arr.map((i) => (
        <div
          key={i}
          className="mt-5 flex min-h-56 w-full flex-col gap-5 rounded-box bg-base-200 p-2 lg:flex-row lg:p-4"
        >
          <div className="flex w-52 flex-row gap-2 lg:flex-col lg:items-end">
            <div className="skeleton size-16 lg:size-24" />
            <div className="skeleton h-3 w-32"></div>
            <div className="skeleton hidden h-2 w-12 lg:block"></div>
            <div className="skeleton hidden h-2 w-24 lg:block"></div>
            <div className="skeleton hidden h-2 w-24 lg:block"></div>
            <div className="skeleton hidden h-2 w-44 lg:block"></div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-4/5"></div>
            <div className="skeleton h-4 w-52"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
