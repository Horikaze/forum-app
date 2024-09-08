"use client";
import { useSession } from "next-auth/react";
import { FormEvent, useRef, useState } from "react";
import { FaRegCircleXmark } from "react-icons/fa6";
import { changeNicknameAction } from "../profileActions";

export default function ChangeNickname({ nickname }: { nickname: string }) {
  const [error, setError] = useState("");
  const [newNickname, setNewNickname] = useState(nickname);
  const [isPending, setIsPending] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const { data: session, update } = useSession();
  const changeNickname = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const nickname = new FormData(e.currentTarget).get("nickname") as string;
      const res = await changeNicknameAction(nickname);
      if (!res.success) {
        setError(res.message!);
        return;
      }
      update({ nickname: nickname });
      ref.current?.close();
    } catch (error) {
      console.log(error);
      setError(`${error}`);
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      <span
        onClick={() => {
          ref.current?.showModal();
        }}
        className="cursor-pointer text-2xl font-bold transition-all hover:text-accent"
      >
        {nickname}
      </span>
      <dialog ref={ref} className="modal">
        <form
          onSubmit={changeNickname}
          className="modal-box flex flex-col items-end gap-2"
        >
          <span className="self-start font-semibold">Zmień nick</span>
          <input
            type="text"
            name="nickname"
            className="input input-bordered w-full"
            placeholder={nickname}
            defaultValue={nickname}
            onChange={() => {
              error !== "" ? setError("") : null;
            }}
          />
          {error !== "" ? (
            <div role="alert" className="alert alert-error">
              <FaRegCircleXmark />
              <span>{error}</span>
            </div>
          ) : null}
          <button disabled={isPending} className="btn btn-primary">
            {isPending ? <span className="loading loading-spinner" /> : null}
            Zapisz
          </button>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button />
        </form>
      </dialog>
    </>
  );
}
