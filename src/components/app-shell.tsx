import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex min-h-12 items-center justify-between">
        <Link
          className="font-pixel text-xs tracking-wide text-[var(--ink)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--rose)]"
          href="/"
        >
          食欲粉碎机
        </Link>
        {title ? (
          <span className="rounded-full bg-white/65 px-3 py-1 text-xs font-bold text-[var(--muted)]">
            {title}
          </span>
        ) : null}
      </header>
      {children}
    </main>
  );
}
