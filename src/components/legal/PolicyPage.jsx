import { Fragment } from 'react';
import { PageHeader } from '../layout/PageHeader';

export function PolicyPage({ title, intro, children }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title}>
        {intro}
      </PageHeader>
      <section className="mx-auto grid max-w-4xl gap-5 px-4 py-8">
        {children}
      </section>
    </>
  );
}

export function PolicySection({ title, children }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-slate-600">{children}</div>
    </article>
  );
}

export function Paragraphs({ items }) {
  return items.map((item) => <p key={item}>{item}</p>);
}

export function BulletList({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function ContactBlock({ subject }) {
  return (
    <>
      <p>For questions regarding {subject}, please contact:</p>
      <p><strong className="text-slate-950">FSD Home Services</strong></p>
      <p>WhatsApp / Phone: <strong className="text-slate-950">03099018308</strong></p>
      <p>
        Email:{' '}
        <a className="font-semibold text-brand-700 hover:underline" href="mailto:fsdhomeservices.pk@gmail.com">
          fsdhomeservices.pk@gmail.com
        </a>
      </p>
    </>
  );
}

export function DefinitionList({ groups }) {
  return groups.map((group) => (
    <Fragment key={group.title}>
      <h3 className="font-bold text-slate-950">{group.title}</h3>
      <BulletList items={group.items} />
    </Fragment>
  ));
}
