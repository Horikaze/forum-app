"use client";
import Link from "next/link";
import { cellColor } from "./CCTable";
import { getCCstring } from "@/app/utils/replayUtils";
import { cn } from "@/app/utils/twUtils";
import { useState } from "react";
import { FaLink } from "react-icons/fa6";

type CellProps = {
  id?: string | null;
  score?: number | null;
  char?: string | null;
  CC?: number | null;
};
type PhantasmCellProps = {
  extra: CellProps;
  phantasm: CellProps;
};
export default function PhantasmCell({ extra, phantasm }: PhantasmCellProps) {
  const [isExtra, setIsExtra] = useState(true);
  return (
    <td
      className={cn(
        "group/ph relative table-cell p-0",
        cellColor[extra.CC || 0],
      )}
      onClick={() => setIsExtra((p) => !p)}
    >
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-2xl font-semibold opacity-60">
        {isExtra ? "Extra" : "Phantasm"}
      </span>
      {isExtra ? (
        <>
          <Link
            href={`/replay/${extra.id}`}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 opacity-0 group-hover/ph:opacity-100"
          >
            <FaLink className="size-5" />
          </Link>
          <div
            data-tip={`${extra.char}`}
            className="tooltip z-10 flex flex-col font-semibold text-white"
          >
            <span>{getCCstring(extra.CC || 0)}</span>{" "}
            {extra.score ? <span>{extra.score.toLocaleString()}</span> : null}
          </div>
        </>
      ) : (
        <>
          <Link
            href={`/replay/${phantasm.id}`}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 opacity-0 group-hover/ph:opacity-100"
          >
            <FaLink className="size-5" />
          </Link>
          <div
            data-tip={`${phantasm.char}`}
            className="tooltip z-10 flex flex-col font-semibold text-white"
          >
            <span>{getCCstring(phantasm.CC || 0)}</span>{" "}
            {phantasm.score ? (
              <span>{phantasm.score.toLocaleString()}</span>
            ) : null}
          </div>
        </>
      )}
    </td>
  );
}
