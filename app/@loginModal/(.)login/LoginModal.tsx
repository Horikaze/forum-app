"use client";
import LoginForm from "@/app/(routes)/login/LoginForm";
import redirectHard from "@/lib/globalActions";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LoginModal({
  redirectTo,
  isAuth,
}: {
  redirectTo: string;
  isAuth: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, [isAuth]);
  if (isAuth) ref.current?.close();
  return (
    <div>
      <dialog ref={ref} className="modal" onClose={() => router.back()}>
        <div className="modal-box flex flex-col items-center justify-center md:w-auto">
          <LoginForm />
          <button
            onClick={() => {
              //hack to bypass intercepting route
              new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
                redirectHard(`/login?redirectTo=${redirectTo}`);
              });
              router.back();
            }}
            className="link mt-6 text-sm"
          >
            FAQ (prejdź do strony logowania)
          </button>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Zamknij</button>
        </form>
      </dialog>
    </div>
  );
}
