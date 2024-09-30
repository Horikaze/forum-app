import { formatDatePost } from "@/app/utils/formatDate";
import { getCCstring, getCharacterFromData } from "@/app/utils/replayUtils";
import db from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import DownloadReplay from "./DownloadReplay";
import DeleteReplay from "./DeleteReplay";

export default async function Replay({ params }: { params: { id: string } }) {
  const replay = await db.replay.findUnique({
    where: {
      replayId: params.id,
    },
    include: {
      profile: {
        select: {
          nickname: true,
          id: true,
        },
      },
    },
  });
  if (!replay) return notFound();

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-box bg-base-300 p-2 lg:p-4">
      <DeleteReplay userId={replay.userId} replayId={replay.replayId} />
      <Image
        fill
        src={`/images/gameCover/Th${replay.game}cover.jpg`}
        alt={`${replay.game}cover`}
        className="select-none object-cover opacity-60"
        sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1000px"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-base-300" />
      <div className="z-10 flex flex-col gap-1 font-bold">
        <p>
          ID: <span className="font-semibold">{replay.replayId}</span>
        </p>
        <p>
          Wysłano przez:{" "}
          <Link
            href={`/user/${replay.profile?.id}`}
            className="link font-semibold"
          >
            {replay.profile?.nickname}
          </Link>
        </p>
        <p>
          Gra: <span className="font-semibold">Touhou: {replay.game}</span>
        </p>
        <p>
          Gracz: <span className="font-semibold">{replay.player}</span>
        </p>
        <p>
          Trudność: <span className="font-semibold">{replay.rank}</span>
        </p>
        <p>
          Osiągnięcie:{" "}
          <span className="font-semibold">
            {getCCstring(replay.achievement)}
          </span>
        </p>
        <p>
          Shot:{" "}
          <span className="font-semibold">
            {getCharacterFromData(replay, true)}
          </span>
        </p>
        <p>
          Score:{" "}
          <span className="font-semibold">
            <span className="text-black dark:text-white">
              {replay.score.toLocaleString()}{" "}
            </span>
            {replay.stageScore.split("+").length > 1 ? (
              <span>
                (
                {replay.stageScore.split("+").map((s, idx) => (
                  <span className="text-sm" key={idx}>
                    {idx > 0 && ", "}S{idx + 1}: {Number(s).toLocaleString()}
                  </span>
                ))}
                )
              </span>
            ) : null}
          </span>
        </p>
        <p>
          Data na powtórce:{" "}
          <span className="font-semibold">
            {formatDatePost(replay.fileDate!)}
          </span>
        </p>
        <p>
          Data pliku:{" "}
          <span className="font-semibold">
            {formatDatePost(replay.replayDate!)}
          </span>
        </p>
        <p>
          Wysłano:{" "}
          <span className="font-semibold">
            {formatDatePost(replay.createdAt!)}
          </span>
        </p>
        <div className="flex items-center gap-1">
          Zweryfikowano:{" "}
          <div className="font-semibold">
            {replay.status ? (
              <FaCheckCircle className="text-success" />
            ) : (
              <FaCircleXmark className="text-warning" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          Pobierz:
          <DownloadReplay
            data={Buffer.from(replay.file).toString("base64")}
            rpy_name={replay.rpyName}
          />
        </div>
        {replay.comment ? (
          <p>
            Komentarz: <span className="font-semibold">{replay.comment}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
