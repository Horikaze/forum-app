import { allGamesString, touhouDifficultysTable } from "@/app/constants/games";
import { ScoreObject } from "@/app/types/gameTypes";
import { getCCstring } from "@/app/utils/replayUtils";
import { cn } from "@/app/utils/twUtils";
import { Table } from "@prisma/client";
import Link from "next/link";
import TakeTableSS from "./TakeTableSS";

const cellColor: Record<number, string> = {
  1: "bg-[#4e5052]",
  2: "bg-[#bb8888]",
  3: "bg-[#0000ff]",
  4: "bg-[#ff0099]",
  5: "bg-[#ff2f00]",
  6: "bg-[#ffbb00]",
};

export default function CCTable({ table }: { table: Table }) {
  let forrmatedObject: Record<string, ScoreObject> = {};
  Object.keys(table).forEach((key) => {
    if (key === "userId") {
      return;
    }
    // @ts-expect-error
    const rankingData = JSON.parse(table[key]);
    forrmatedObject[key] = rankingData as ScoreObject;
  });
  return (
    <div className="overflow-x-auto" id="profileTable">
      <table className="table text-center">
        <thead>
          <tr>
            <th>GAME</th>
            {touhouDifficultysTable.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allGamesString.slice(0, -1).map((g) => {
            return (
              <tr key={g}>
                <th className="text-start">{g}</th>

                {touhouDifficultysTable.map((d) => {
                  const { CC, char, id, score } =
                    forrmatedObject[g.toLowerCase()][d.toUpperCase()]!;
                  return (
                    <td
                      key={d}
                      data-tip={`${char}`}
                      className={cn(
                        "table-cell p-0",
                        cellColor[CC || 0],
                        CC !== 0 ? "tooltip cursor-pointer" : "",
                      )}
                    >
                      <Link
                        href={`replay/${id}`}
                        className="flex flex-col font-semibold text-white"
                      >
                        <span>{getCCstring(CC || 0)}</span>{" "}
                        {score ? <span>{score.toLocaleString()}</span> : null}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
