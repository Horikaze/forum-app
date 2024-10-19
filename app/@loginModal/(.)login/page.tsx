import { auth } from "@/auth";
import LoginModal from "./LoginModal";

export default async function LoginPortal(
  props: {
    searchParams: Promise<{ redirectTo: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await auth();
  return (
    <LoginModal
      redirectTo={searchParams.redirectTo}
      isAuth={session ? true : false}
    />
  );
}
