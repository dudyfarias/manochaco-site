import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
};

const variants = {
  primary:
    "border-[#d1a137] bg-[#d1a137] text-black hover:border-[#f0c35d] hover:bg-[#f0c35d]",
  secondary:
    "border-zinc-300 bg-white text-black hover:border-[#d1a137] hover:bg-[#f4efe5]",
  ghost:
    "border-white/20 bg-transparent text-white hover:border-[#d1a137] hover:bg-white/5 hover:text-[#f0c35d]",
  dark: "border-zinc-950 bg-zinc-950 text-white hover:border-[#d1a137] hover:text-[#f0c35d]",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-3 text-sm font-bold transition ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}
