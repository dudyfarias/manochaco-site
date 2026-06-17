type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  dark?: boolean;
};

export function StatCard({ label, value, detail, dark = false }: StatCardProps) {
  return (
    <article
      className={`h-full rounded-lg border p-5 ${
        dark
          ? "border-white/10 bg-white/[0.045]"
          : "border-zinc-200 bg-white"
      }`}
    >
      <p
        className={`text-xs font-black uppercase ${
          dark ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-4 break-words text-4xl font-black leading-none sm:text-5xl ${
          dark ? "text-[#f0c35d]" : "text-zinc-950"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <p
          className={`mt-3 text-sm leading-6 ${dark ? "text-zinc-300" : "text-zinc-500"}`}
        >
          {detail}
        </p>
      ) : null}
    </article>
  );
}
