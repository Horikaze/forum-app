"use client";
import LoginForm from "@/app/(routes)/login/LoginForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";

export default function LoginModal(props: {
  searchParams: Promise<{ redirectTo: string }>;
}) {
  const { redirectTo } = use(props.searchParams);
  const router = useRouter();
  const session = useSession();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, [session]);
  if (session) ref.current?.close();
  return (
    <div>
      <dialog
        ref={ref}
        className="modal"
        onClose={() => {
          router.back();
        }}
      >
        <div className="modal-box flex flex-col items-center justify-center md:w-auto">
          <LoginForm />
          <a
            href={`/login?redirectTo=${redirectTo}`}
            className="link mt-6 text-sm"
          >
            FAQ (prejdź do strony logowania)
          </a>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Zamknij</button>
        </form>
      </dialog>
    </div>
  );
}
