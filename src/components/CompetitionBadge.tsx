import type { CompetitionKind } from "@/types";

type CompetitionBadgeProps = {
  kind: CompetitionKind;
  children: React.ReactNode;
};

const styles: Record<CompetitionKind, string> = {
  liga7: "border-[#d1a137] bg-[#d1a137] text-black",
  "copa-futfudas": "border-white bg-white text-black",
  "copa-amstel": "border-emerald-900 bg-emerald-900 text-white",
  chuteira: "border-sky-900 bg-sky-900 text-white",
  amistoso: "border-zinc-500 bg-zinc-500 text-white",
};

export function CompetitionBadge({ kind, children }: CompetitionBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase ${styles[kind]}`}
    >
      {children}
    </span>
  );
}
