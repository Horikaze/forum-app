"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { addAchievementAction } from "../adminActions";

export default function ChangeAchievements() {
  const [isPending, setIsPending] = useState(false);

  const updateAchievement = async (formData: FormData) => {
    try {
      setIsPending(true);
      const achievementId = Number(formData.get("achievementId") as string);
      const userId = formData.get("userId") as string;
      const action = formData.get("action") as "add" | "remove";

      const res = await addAchievementAction({
        achievementId,
        userId,
        action: action as any,
      });

      if (!res.success) {
        throw new Error(res.message);
      }
      toast.success(
        `${action === "add" ? "Dodano" : "Usunięto"} osiągnięcie ID: ${achievementId} dla: ${userId}`,
      );
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      action={updateAchievement}
      className="relative mt-5 max-h-72 rounded-box bg-base-300 p-2 lg:p-4"
    >
      <p className="text-center text-2xl font-semibold">Osiągnięcia</p>
      <div className="divider" />
      <div className="flex gap-1">
        <input
          type="number"
          name="achievementId"
          className="input input-sm w-24"
          placeholder="Achi ID"
        />
        <input
          type="text"
          name="userId"
          className="input input-sm w-36"
          placeholder="User ID"
        />
        <button
          type="submit"
          name="action"
          value="add"
          disabled={isPending}
          className="btn btn-primary btn-sm"
        >
          Dodaj
          {isPending ? <span className="loading loading-spinner" /> : null}
        </button>
        <button
          type="submit"
          name="action"
          value="remove"
          disabled={isPending}
          className="btn btn-primary btn-warning btn-sm"
        >
          Usuń
          {isPending ? <span className="loading loading-spinner" /> : null}
        </button>
      </div>
    </form>
  );
}
