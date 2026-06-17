type EmptyStateProps = {
  title: string;
  description: string;
  dark?: boolean;
};

export function EmptyState({ title, description, dark = false }: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        dark
          ? "border-white/10 bg-white/[0.04] text-white"
          : "border-zinc-200 bg-white text-zinc-950"
      }`}
    >
      <p className="text-lg font-black">{title}</p>
      <p className={`mt-2 text-sm leading-6 ${dark ? "text-zinc-300" : "text-zinc-600"}`}>
        {description}
      </p>
    </div>
  );
}
