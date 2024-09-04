import { auth } from "@/auth";
import LoginModal from "./LoginModal";

export default async function LoginPortal({
  searchParams,
}: {
  searchParams: { redirectTo: string };
}) {
  const session = await auth();
  return (
    <LoginModal
      redirectTo={searchParams.redirectTo}
      isAuth={session ? true : false}
    />
  );
}
