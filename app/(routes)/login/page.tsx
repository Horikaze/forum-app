import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default async function Page({
  searchParams,
}: {
  searchParams: { redirectTo: string };
}) {

  const loginFaq = [
    {
      title: "Czy logowanie się przez providerów(np. Discord) jest bezpieczne?",
      desc: "Pewka, są używane tylko do logowania dzięki OAuth. Dla pewność można sprawdzić link. Oauth jest polecane jeżeli nie chcemy stracić konta.",
    },
    {
      title: "Jakie dane są przechowywane?",
      desc: "Do logowania potrzebny jest tylko nick, hasło. Jeżeli logujemy się przez provder może być pobierany również e-mail, lecz jest pobierany tylko po to, aby wygenerować ID(potrzebne do łączenia kont z różnych providerów), a następnie jest usuwany, więc ostatecznie nikt nie ma w niego wglądu.",
    },
  ];
  return (
    <div className="flex flex-col items-center pt-3 p-2">
      <Suspense>
        <LoginForm />
      </Suspense>
      <div className="mt-6 min-h-80 max-w-[700px] gap-2 flex flex-col">
        <div className="divider">Login FAQ</div>
        {loginFaq.map((e, idx) => (
          <div key={idx} className="collapse bg-base-200 collapse-arrow">
            <input type="checkbox" />
            <div className="collapse-title font-medium">{e.title}</div>
            <div className="collapse-content">
              <p>{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
