import { AppShell } from "@/components/app-shell";
import { ActionLink } from "@/components/ui/action-link";

interface FlowPlaceholderProps {
  description: string;
  nextHref?: string;
  nextLabel?: string;
  title: string;
}

export function FlowPlaceholder({
  description,
  nextHref,
  nextLabel,
  title,
}: FlowPlaceholderProps) {
  return (
    <AppShell title="MVP 骨架">
      <section className="my-auto rounded-[2rem] border-2 border-white/80 bg-white/65 p-6 shadow-[0_16px_50px_rgba(99,72,103,0.12)] backdrop-blur-sm">
        <p className="mb-2 text-xs font-extrabold tracking-[0.18em] text-[var(--rose-dark)]">
          流程页面
        </p>
        <h1 className="text-3xl font-black tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">{description}</p>
        <div className="mt-8 flex flex-col gap-3">
          {nextHref && nextLabel ? (
            <ActionLink href={nextHref}>{nextLabel}</ActionLink>
          ) : null}
          <ActionLink href="/" variant="secondary">
            返回欢迎页
          </ActionLink>
        </div>
      </section>
    </AppShell>
  );
}
