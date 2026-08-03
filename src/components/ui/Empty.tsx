export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card text-center text-gray-500">
      <p className="font-medium text-forest-dark">{title}</p>
      {hint && <p className="mt-1 text-sm">{hint}</p>}
    </div>
  );
}
