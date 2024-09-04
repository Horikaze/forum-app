import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <h2>Nie znaleziono</h2>
      <p>Nie można znaleźć żądanych zasobów</p>
      <Link href="/" className="btn btn-link">Wróć do strony gółwnej</Link>
    </div>
  );
}
