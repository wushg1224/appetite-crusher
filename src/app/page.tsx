import { AppShell } from "@/components/app-shell";
import { PixelPen } from "@/components/pixel-pen";
import { ActionLink } from "@/components/ui/action-link";

export default function HomePage() {
  return (
    <AppShell>
      <section className="flex flex-1 flex-col items-center justify-center pb-6 text-center">
        <p className="mb-3 rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold tracking-[0.14em] text-[var(--rose-dark)]">
          15 秒像素仪式
        </p>
        <h1 className="font-pixel text-[clamp(2rem,10vw,3.25rem)] leading-tight text-[var(--ink)]">
          食欲
          <br />
          <span className="text-[var(--rose-dark)]">粉碎机</span>
        </h1>

        <div className="my-7 flex min-h-52 w-full items-center justify-center rounded-[2.5rem] border-2 border-white/80 bg-[radial-gradient(circle_at_center,#ffffff_0_18%,transparent_19%),linear-gradient(135deg,rgba(255,255,255,.7),rgba(205,236,247,.62))] p-5">
          <PixelPen />
        </div>

        <p className="max-w-xs text-sm leading-6 text-[var(--muted)]">
          长按完成一段可爱、缓慢的虚拟注射体验。纯属娱乐，不模拟真实治疗。
        </p>

        <div className="mt-7 grid w-full gap-3">
          <ActionLink href="/dose">开始粉碎食欲</ActionLink>
          <ActionLink href="/history" variant="secondary">
            查看历史记录
          </ActionLink>
        </div>
      </section>

      <p className="rounded-2xl border border-[var(--rose-soft)] bg-white/75 px-4 py-3 text-center text-xs leading-5 text-[var(--muted)]">
        本网站仅供娱乐，不代表真实药效或医疗建议。
      </p>
    </AppShell>
  );
}
