"use client";
import { ReplayApiInfo } from "@/app/types/gameTypes";
import { getCharacterFromData } from "@/app/utils/replayUtils";
import React, { useRef, useState } from "react";
import { FaX } from "react-icons/fa6";
import { getRpyDataAction, sendReplayAction } from "../profileActions";
import toast from "react-hot-toast";
import { achievementRankValues } from "@/app/constants/games";

export default function AddReplay() {
  const [file, setFile] = useState<File | null>(null);
  const [rpyData, setRpyData] = useState<ReplayApiInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [achievement, setAchievement] = useState("");
  const [isPending, setIsPending] = useState(false);
  const resetAll = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setRpyData(null);
    setAchievement("");
  };

  const sendReplay = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsPending(true);
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const comment = formData.get("comment") as string;
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      if (!file || !rpyData) throw new Error("Błąd z plikiem");
      const res = await sendReplayAction(rpyData, file, {
        comment,
        achievement,
        fileDate: file.lastModified,
      });
      if (!res.success) throw new Error("Wystąpił problem :<");
      toast.success("Wysłano!");
      resetAll();
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };

  const getRpyData = async (file: File | null) => {
    try {
      if (!file) throw new Error("Brak pliku!");
      setFile(file);
      const res = await getRpyDataAction(file!);
      if (!res.success) throw new Error(`${res.message}`);
      setRpyData(res.message as ReplayApiInfo);
    } catch (error) {
      toast.error(`${error}`);
      // resetAll();
    }
  };

  return (
    <form onSubmit={sendReplay} className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            getRpyData(e.target.files![0]);
          }}
          accept=".rpy"
          className="file-input file-input-bordered file-input-xs w-full max-w-sm"
        />
        <FaX
          onClick={resetAll}
          className="cursor-pointer opacity-80 hover:opacity-100"
        />
      </div>
      {rpyData ? (
        <div className="flex gap-2">
          <div className="flex w-full flex-col gap-1">
            <p>
              <span className="opacity-80">Player: </span>
              {rpyData?.player}
            </p>
            <p>
              <span className="opacity-80">Rank: </span>
              {rpyData?.rank}
            </p>
            <p>
              <span className="opacity-80">Shot: </span>
              {getCharacterFromData(rpyData!, true)}
            </p>
            <p>
              <span className="opacity-80">Slow rate: </span>
              {rpyData?.slowRate} %
            </p>
            <p>
              <span className="opacity-80">Stage: </span>
              {rpyData?.stage || "Brak danych"}
            </p>
            <p>
              <span className="opacity-80">Score: </span>
              {rpyData?.stageScore.at(-1)?.toLocaleString()}
            </p>
          </div>
          <div className="flex w-full flex-col">
            <span>Komentarz</span>
            <textarea
              maxLength={300}
              name="comment"
              className="textarea textarea-xs h-full resize-none"
              placeholder="Czy replay ma problem z odtwarzaniem, desync etc."
            />
            <div className="flex flex-wrap">
              <label className="label flex cursor-pointer gap-1 self-start">
                <span className="label-text">CC</span>
                <input
                  defaultChecked
                  name={"CC"}
                  type="checkbox"
                  className="checkbox"
                />
              </label>
              {Object.keys(achievementRankValues)
                .slice(1)
                .map((a, idx) => (
                  <label
                    key={a}
                    className="label flex cursor-pointer gap-1 self-start"
                  >
                    <span className="label-text">{a}</span>
                    <input
                      onClick={() => {
                        achievement !== a
                          ? setAchievement(a)
                          : setAchievement("");
                      }}
                      type="checkbox"
                      checked={achievement === a}
                      className="checkbox"
                    />
                  </label>
                ))}
            </div>
          </div>
        </div>
      ) : null}
      {rpyData ? (
        <div className="flex justify-end">
          <button disabled={isPending} className="btn btn-primary">
            {isPending ? <span className="loading loading-spinner" /> : null}
            Wyślij
          </button>
        </div>
      ) : null}
    </form>
  );
}
