import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-black uppercase text-[#9a6a12]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <AdminCard>
      <p className="text-xs font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-3 text-4xl font-black text-zinc-950">{value}</p>
      {detail ? <p className="mt-2 text-sm text-zinc-500">{detail}</p> : null}
    </AdminCard>
  );
}

export function AdminButtonLink({
  href,
  children,
  tone = "primary",
}: {
  href: string;
  children: ReactNode;
  tone?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={
        tone === "primary"
          ? "inline-flex min-h-10 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-4 py-2 text-sm font-black text-black transition hover:bg-[#f0c35d]"
          : "inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-800 transition hover:border-[#d1a137] hover:text-[#9a6a12]"
      }
    >
      {children}
    </Link>
  );
}

export function AdminNotice({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const saved = typeof searchParams?.saved === "string" ? searchParams.saved : "";
  const error = typeof searchParams?.error === "string" ? searchParams.error : "";

  if (!saved && !error) {
    return null;
  }

  return (
    <div
      className={`mt-5 rounded-md border px-4 py-3 text-sm font-bold ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ? decodeURIComponent(error) : "Alteração salva com sucesso."}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AdminCard className="py-10 text-center">
      <h2 className="text-xl font-black text-zinc-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
        {description}
      </p>
    </AdminCard>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-zinc-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 outline-none transition focus:border-[#d1a137]"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-zinc-500">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 outline-none transition focus:border-[#d1a137]"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-zinc-500">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 outline-none transition focus:border-[#d1a137]"
      >
        {children}
      </select>
    </label>
  );
}

export function SubmitButton({ children = "Salvar" }: { children?: ReactNode }) {
  return (
    <button className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f0c35d]">
      {children}
    </button>
  );
}
