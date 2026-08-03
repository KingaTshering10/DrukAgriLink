import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-4xl font-bold text-forest">404</p>
      <p className="text-gray-600">We could not find that page.</p>
      <Link href="/" className="btn-primary">Back home</Link>
    </main>
  );
}
