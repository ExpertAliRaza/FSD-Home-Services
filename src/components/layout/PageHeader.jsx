export function PageHeader({ eyebrow, title, children }) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">{eyebrow}</p>}
        <h1 className="max-w-4xl text-3xl font-bold tracking-normal text-slate-950 md:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-3xl text-lg text-slate-600">{children}</div>}
      </div>
    </section>
  );
}
