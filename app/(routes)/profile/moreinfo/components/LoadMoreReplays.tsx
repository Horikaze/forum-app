"use client";

import { RecentReplay } from "@/app/types/prismaTypes";
import { formatDatePost } from "@/app/utils/formatDate";
import { getCCstring } from "@/app/utils/replayUtils";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCalendar } from "react-icons/fa6";
import { fetchMoreReplaysAction } from "../dataActions";
import { useSession } from "next-auth/react";

export default function LoadMoreReplays({
  take,
  replaysCount,
}: {
  take: number;
  replaysCount: number;
}) {
  const [replays, setReplays] = useState<RecentReplay[]>([]);
  const [count, setCount] = useState(take);
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const fetchMoreReplays = async () => {
    try {
      setIsPending(true);
      const res = await fetchMoreReplaysAction(
        session?.user.id!,
        take,
        count * take,
      );
      setReplays((p) => [...p, ...res!]);
      setCount((prev) => prev + 1);
    } catch (error) {
      toast.error("Błąd z serwerem");
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      {replays!.map((rpy, idx) => (
        <RecentReplayComponent rpy={rpy} key={idx} />
      ))}
      <button
        disabled={replays.length >= replaysCount - take || isPending}
        className="btn btn-ghost btn-sm disabled:btn-ghost"
        onClick={fetchMoreReplays}
      >
        {isPending ? <span className="loading loading-spinner"></span> : null}
        {replays.length >= replaysCount - take
          ? "Brak więcej powtórek"
          : "Więcej..."}
      </button>
    </>
  );
}

// react is bugged as fk so we need duplicate components here
const RecentReplayComponent = ({ rpy }: { rpy: RecentReplay }) => {
  return (
    <Link
      href={`/replay/${rpy.replayId}`}
      className="line-clamp-2 flex flex-col gap-px rounded-md border-b-2 border-base-100 bg-base-200 p-1 text-sm transition-all [overflow-wrap:anywhere] hover:bg-base-100"
    >
      <p>
        Touhou: {rpy.game},{" "}
        {rpy.score.toLocaleString() +
          " " +
          rpy.character +
          " " +
          rpy.shotType +
          " " +
          getCCstring(rpy.achievement)}
      </p>
      <div className="mt-2 flex justify-between text-xs opacity-80">
        <p>
          <span>Przez:</span> {rpy.profile?.nickname}
        </p>
        <div className="flex items-center gap-1">
          <FaCalendar /> {formatDatePost(rpy.createdAt)}
        </div>
      </div>
    </Link>
  );
};
