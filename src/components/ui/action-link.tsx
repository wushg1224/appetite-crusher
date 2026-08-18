import Link from "next/link";

interface ActionLinkProps {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}

export function ActionLink({
  children,
  href,
  variant = "primary",
}: ActionLinkProps) {
  const variantClass =
    variant === "primary"
      ? "bg-[var(--rose)] text-white shadow-[0_6px_0_var(--rose-dark)] hover:-translate-y-0.5"
      : "border-2 border-[var(--ink)] bg-white/75 text-[var(--ink)] shadow-[0_4px_0_var(--blue)] hover:-translate-y-0.5";

  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-center font-bold transition-transform focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--rose)] ${variantClass}`}
      href={href}
    >
      {children}
    </Link>
  );
}
