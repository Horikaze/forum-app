"use client";

import { useState } from "react";

export default function ChangeAchievements() {
  const [isPending, setIsPending] = useState(false);

  const sen = async()=>{

  }
  return (
    <div className="relative mt-5 max-h-72 rounded-box bg-base-300 p-2 lg:p-4">
      <p className="text-center text-2xl font-semibold">Osiągnięcia</p>
      <div className="divider" />
      <div className="flex gap-1">
        <input type="text" className="input input-sm w-24" placeholder="ID" />
        <input
          type="text"
          className="input input-sm w-36"
          placeholder="User ID"
        />
        <button disabled={isPending} className="btn btn-primary btn-sm">
          Dodaj
          {isPending ? <span className="loasp loading" /> : null}
        </button>
        <button
          disabled={isPending}
          className="btn btn-primary btn-warning btn-sm"
        >
          Usuń
          {isPending ? <span className="loasp loading" /> : null}
        </button>
      </div>
    </div>
  );
}
