"use client";
import { cn } from "@/app/utils/twUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaDiscord, FaGithub } from "react-icons/fa6";
import { loginUserAction, loginWithProvider } from "./loginActions";
export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  //we get callbackUrl if middlware redirects
  const redirectTo =
    searchParams.get("redirectTo") ||
    searchParams.get("callbackUrl")?.split(origin).at(-1) ||
    "/";
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setnickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loginUser = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("isLogin", `${isLogin}`);
    formData.append("nickname", nickname);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    const res = await loginUserAction(formData);
    setIsLoading(false);
    if (res?.success) {
      router.push(`${redirectTo}`);
      new Promise((resolve) => setTimeout(resolve, 500)).then(async () => {
        window.location.reload();
      });
      return;
    }
    toast.error(`${res?.message}`);
  };
  return (
    <div className="card w-full md:w-96">
      <div role="tablist" className="tabs tabs-lifted">
        <button
          onClick={() => setIsLogin(true)}
          role="tab"
          type="button"
          className={cn("tab", isLogin && "tab-active")}
        >
          Logowanie
        </button>
        <button
          onClick={() => setIsLogin(false)}
          role="tab"
          type="button"
          className={cn("tab", !isLogin && "tab-active")}
        >
          Rejestracja
        </button>
      </div>
      <div className="tab-content flex h-full flex-col rounded-b-box border-base-300 p-2">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Nickname</span>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setnickname(e.target.value)}
            placeholder="Nickname"
            name="nickname"
            className="input input-bordered w-full"
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Hasło</span>
          </div>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            name="password"
            className="input input-bordered w-full"
          />
        </label>
        {isLogin ? null : (
          <label className="form-control">
            <div className="label">
              <span className="label-text">Powtórz hasło</span>
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz Hasło"
              name="confirmPassword"
              className="input input-bordered w-full"
            />
          </label>
        )}
        <button
          type="button"
          className="btn btn-primary my-4"
          onClick={loginUser}
        >
          {isLoading ? <span className="loading loading-spinner" /> : null}
          {isLogin ? "Zaloguj" : "Rejestruj"}
        </button>
        <div className="divider">
          <p>
            Lub zaloguj się przez <span className="text-sm">(zalecane)</span>
          </p>
        </div>
        <div className="flex justify-evenly">
          <button
            className="btn btn-ghost p-1.5 px-6"
            type="button"
            onClick={() => loginWithProvider("discord", redirectTo)}
          >
            <FaDiscord className="size-full" />
          </button>
          <button
            className="btn btn-ghost p-1.5 px-6"
            type="button"
            onClick={() => loginWithProvider("github", redirectTo)}
          >
            <FaGithub className="size-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
