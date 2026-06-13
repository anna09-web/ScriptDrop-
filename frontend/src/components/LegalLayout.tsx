import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { Footer } from './Footer';

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
          <Logo />
        </div>
      </nav>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: {updated}</p>
        <div className="legal mt-8 space-y-8 text-text-primary">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold">{heading}</h2>
      <div className="space-y-3 leading-relaxed text-text-muted">{children}</div>
    </section>
  );
}
