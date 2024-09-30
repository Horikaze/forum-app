"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { deleteReplayAction } from "../../profile/profileActions";

export default function DeleteReplay({
  userId,
  replayId,
}: {
  userId: string;
  replayId: string;
}) {
  const { data: session } = useSession();
  if (!session || session.user.id !== userId) return null;
  return (
    <div className="dropdown dropdown-end absolute right-5 top-5 z-20 opacity-0 transition-all group-hover:opacity-100">
      <button
        tabIndex={0}
        className="flex size-6 cursor-pointer items-center justify-center rounded-sm opacity-60 hover:opacity-100"
        role="button"
      >
        <FaTrash className="size-4 text-warning" />
      </button>
      <div
        tabIndex={0}
        className="card dropdown-content card-compact z-10 items-center justify-center whitespace-nowrap bg-base-300 shadow"
      >
        <div tabIndex={0} className="card-body">
          <p className="text-warning">Na pewno chcesz usunąć Powtórkę?</p>
          <button
            onClick={async () => {
              await deleteReplayAction({ replayId });
              redirect("/profile");
            }}
            className="btn btn-warning btn-sm"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}
