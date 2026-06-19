import Link from "next/link";
import type { ReactNode } from "react";

export function AccountShell({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="bg-[#f4f1e8] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-zinc-200 bg-white lg:grid-cols-[1fr_0.78fr]">
        <div className="p-6 sm:p-9 lg:p-12">
          <p className="text-xs font-black uppercase text-[#9a6a12]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black text-zinc-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
        <div className="border-t border-zinc-200 bg-zinc-950 p-6 text-white sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
          {aside ?? (
            <div>
              <p className="text-xs font-black uppercase text-[#d1a137]">
                Clube Atlético Manochaco
              </p>
              <h2 className="mt-3 text-3xl font-black">Preto e dourado desde 2014.</h2>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Uma conta para acompanhar o clube, atualizar seus dados e acessar os
                recursos liberados para cada perfil.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function AccountField({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  defaultValue,
  minLength,
  maxLength,
  min,
  max,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string | number | null;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-zinc-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        placeholder={placeholder}
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 outline-none transition focus:border-[#d1a137] focus:ring-2 focus:ring-[#d1a137]/20"
      />
    </label>
  );
}

export function AccountTextArea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-zinc-500">{label}</span>
      <textarea
        name={name}
        rows={4}
        maxLength={1000}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 outline-none transition focus:border-[#d1a137] focus:ring-2 focus:ring-[#d1a137]/20"
      />
    </label>
  );
}

export function AccountSubmitButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-5 py-3 text-sm font-black text-black transition hover:bg-[#f0c35d] focus:outline-none focus:ring-2 focus:ring-[#9a6a12] focus:ring-offset-2">
      {children}
    </button>
  );
}

export function AccountNotice({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-bold ${styles[tone]}`}>
      {children}
    </div>
  );
}

export function AccountTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-bold text-[#8a5b0b] hover:text-black">
      {children}
    </Link>
  );
}
