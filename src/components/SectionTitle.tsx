type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: SectionTitleProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`max-w-3xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-black uppercase text-[#b9872a]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`text-3xl font-black leading-tight sm:text-4xl ${
          isDark ? "text-white" : "text-zinc-950"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${
            isDark ? "text-zinc-300" : "text-zinc-600"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
