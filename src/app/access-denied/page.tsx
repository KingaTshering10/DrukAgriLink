import Link from "next/link";
import { ShieldAlert } from "lucide-react";
export default function AccessDenied() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <ShieldAlert className="text-crimson" size={40} />
      <h1 className="text-xl font-bold text-forest-dark">Access denied</h1>
      <p className="text-gray-600">This area is for a different role. If you think this is a mistake, check your profile role.</p>
      <Link href="/" className="btn-primary">Back home</Link>
    </main>
  );
}
