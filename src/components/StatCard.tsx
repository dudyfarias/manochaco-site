type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  dark?: boolean;
};

export function StatCard({ label, value, detail, dark = false }: StatCardProps) {
  return (
    <article
      className={`rounded-lg border p-5 ${
        dark
          ? "border-white/10 bg-white/[0.06]"
          : "border-zinc-200 bg-white shadow-sm"
      }`}
    >
      <p
        className={`text-sm font-semibold uppercase ${
          dark ? "text-zinc-300" : "text-zinc-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-4 break-words text-3xl font-black leading-none sm:text-4xl ${
          dark ? "text-[#f0c35d]" : "text-zinc-950"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <p className={`mt-2 text-sm ${dark ? "text-zinc-300" : "text-zinc-500"}`}>
          {detail}
        </p>
      ) : null}
    </article>
  );
}
