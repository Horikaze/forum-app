"use client";
import { ReplayApiInfo } from "@/app/types/gameTypes";
import {
  getCharacterFromData,
  getGameNumberFromReplayName,
} from "@/app/utils/replayUtils";
import React, { useRef, useState } from "react";
import { FaX } from "react-icons/fa6";
import { getRpyDataAction, sendReplayAction } from "../[user]/profileActions";
import toast from "react-hot-toast";
import { achievementRankValues } from "@/app/constants/games";

export default function AddReplay() {
  const [file, setFile] = useState<File | null>(null);
  const [rpyData, setRpyData] = useState<ReplayApiInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [achievement, setAchievement] = useState("CC");
  const [isPending, setIsPending] = useState(false);
  const resetAll = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setRpyData(null);
    setAchievement("CC");
  };

  const sendReplay = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsPending(true);
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const comment = formData.get("comment") as string;
      const cc = formData.get("CC") as string;
      if (!cc) throw new Error("Replay musi być 1cc");
      if (!file || !rpyData) throw new Error("Błąd z plikiem");
      const res = await sendReplayAction(rpyData, file, {
        comment,
        achievement,
        fileDate: file.lastModified,
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Wysłano powtórkę!");
      resetAll();
      form.reset();
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };

  const getRpyData = async (file: File | null) => {
    setIsPending(true);
    try {
      if (!file) throw new Error("Brak pliku!");
      setFile(file);
      const res = await getRpyDataAction(file!);
      if (!res.success) throw new Error(`${res.message}`);
      setRpyData(res.message as ReplayApiInfo);
    } catch (error) {
      toast.error(`Wystąpił błąd z serwerm :<`);
    } finally {
    }
    setIsPending(false);
  };

  return (
    <div className="relative mt-5 rounded-box bg-base-300 p-2 lg:p-4">
      <p className="text-center text-2xl font-semibold">Dodaj powtórkę</p>
      <div className="divider" />
      <form
        onSubmit={sendReplay}
        className="flex flex-col gap-2"
        id="sendReplay"
      >
        <div className="flex items-center justify-center gap-2">
          <input
            disabled={isPending}
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

        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex w-full flex-col gap-1">
            <p>
              <span className="opacity-80">Touhou: </span>
              {rpyData ? getGameNumberFromReplayName(rpyData?.rpyName) : ""}
            </p>
            <p>
              <span className="opacity-80">Player: </span>
              {rpyData?.player || ""}
            </p>
            <p>
              <span className="opacity-80">Rank: </span>
              {rpyData?.rank || ""}
            </p>
            <p>
              <span className="opacity-80">Shot: </span>
              {rpyData ? getCharacterFromData(rpyData!, true) : ""}
            </p>
            <p>
              <span className="opacity-80">Slow rate: </span>
              {rpyData?.slowRate || ""}
            </p>
            <p>
              <span className="opacity-80">Stage: </span>
              {rpyData?.stage || ""}
            </p>
            <p>
              <span className="opacity-80">Score: </span>
              {rpyData?.stageScore.at(-1)?.toLocaleString() || ""}
            </p>
          </div>
          <div className="flex w-full flex-col">
            <span>Komentarz</span>
            <textarea
              maxLength={300}
              name="comment"
              className="textarea textarea-xs h-full resize-none rounded-sm"
              placeholder="Czy replay ma problem z odtwarzaniem, desync etc."
            />
            <div className="flex flex-wrap">
              <label className="label flex cursor-pointer gap-1 self-start">
                <input
                  defaultChecked
                  name={"CC"}
                  type="checkbox"
                  className="checkbox"
                />
                <span className="label-text">1CC</span>
              </label>
              {Object.keys(achievementRankValues)
                .slice(1)
                .map((a, idx) => (
                  <label
                    key={a}
                    className="label flex cursor-pointer gap-1 self-start"
                  >
                    <input
                      onChange={() => {
                        achievement !== a
                          ? setAchievement(a)
                          : setAchievement("CC");
                      }}
                      type="checkbox"
                      checked={achievement === a}
                      className="checkbox"
                    />
                    <span className="label-text">{a}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button disabled={isPending || !rpyData} className="btn btn-primary">
            {isPending ? <span className="loading loading-spinner" /> : null}
            Wyślij
          </button>
        </div>
      </form>
    </div>
  );
}
