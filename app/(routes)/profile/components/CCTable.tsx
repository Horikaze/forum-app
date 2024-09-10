import { allGamesString, touhouDifficultysTable } from "@/app/constants/games";

export default function CCTable() {
  return (
    <div className="overflow-x-auto">
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
          {allGamesString.map((g) => {
            return (
              <tr key={g}>
                <th className="text-start">{g}</th>
                <td className="cursor-pointer bg-warning text-warning-content opacity-80 hover:opacity-100">
                  1CC
                </td>
                <td className="cursor-pointer bg-warning text-warning-content opacity-80 hover:opacity-100">
                  1CC
                </td>
                <td className="cursor-pointer bg-warning text-warning-content opacity-80 hover:opacity-100">
                  1CC
                </td>
                <td className="cursor-pointer bg-warning text-warning-content opacity-80 hover:opacity-100">
                  1CC
                </td>
                <td className="cursor-pointer bg-warning text-warning-content opacity-80 hover:opacity-100">
                  1CC
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
