export function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass = 'focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 shadow-sm';
