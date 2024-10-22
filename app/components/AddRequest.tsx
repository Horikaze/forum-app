"use client";

import { sendRequestAction } from "@/lib/globalActions";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { requestCategory } from "../constants/forum";
import { cn } from "../utils/twUtils";
import { redirect } from "next/navigation";

type AddRequestProps = {
  children: React.ReactNode;
  defaultValue?: string;
};

export default function AddRequest({
  children,
  defaultValue,
}: AddRequestProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [target, setTarget] = useState(
    defaultValue || requestCategory[0].target,
  );
  const addRequest = async () => {
    let isError = false;
    let userId = "";
    try {
      const res = await sendRequestAction(inputValue);
      if (!res.success) throw new Error(`${res.message}`);
      // message is userId
      userId = res.message;
      toast.success("Wysłano");
      ref.current?.close();
    } catch (error) {
      isError = true;
      toast.error(`${error}`);
    } finally {
      if (!isError) {
        redirect(`/profile/${userId}/moreinfo#req`);
      }
      setIsPending(false);
    }
  };
  return (
    <>
      <div onClick={() => ref.current?.showModal()} role="button">
        {children}
      </div>
      <dialog ref={ref} className="modal">
        <div className="modal-box flex flex-col items-end gap-2">
          <h3 className="self-start text-lg font-bold">Dodaj zapytanie</h3>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              requestCategory.find((i) => i.target === target)?.summary
            }
            className="textarea bordered min-h-32 w-full overflow-y-auto border-base-300"
          />
          <div className="flex w-full justify-evenly">
            {requestCategory.map((t) => (
              <button
                key={t.title}
                className={cn("btn btn-sm", {
                  "btn-primary": target === t.target,
                })}
                type="button"
                onClick={() => setTarget(t.target)}
              >
                {t.title}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <form method="dialog">
              <button className="btn">Zamknij</button>
            </form>
            <button
              onClick={addRequest}
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? <span className="loading loading-spinner" /> : null}
              Wyślij
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
