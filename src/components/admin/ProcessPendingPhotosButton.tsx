"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProcessPendingPhotosButton({ photoIds }: { photoIds: string[] }) {
  const router = useRouter();
  const [progress, setProgress] = useState("");
  const [pending, setPending] = useState(false);

  async function processPending() {
    setPending(true);
    let completed = 0;

    try {
      for (const photoId of photoIds) {
        setProgress(`Processando ${completed + 1} de ${photoIds.length}...`);
        const response = await fetch("/api/admin/face-recognition/process-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId }),
        });

        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          setProgress(
            `Interrompido após ${completed} foto(s): ${result.error ?? "falha no processamento"}`,
          );
          router.refresh();
          return;
        }

        completed += 1;
      }
      setProgress(`${completed} foto(s) processada(s).`);
      router.refresh();
    } catch (error) {
      setProgress(
        `Interrompido após ${completed} foto(s): ${error instanceof Error ? error.message : "falha de rede"}`,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={processPending}
        disabled={pending || photoIds.length === 0}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-4 py-2 text-sm font-black text-black transition hover:bg-[#f0c35d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Processando fila..." : `Processar pendentes (${photoIds.length})`}
      </button>
      {progress ? (
        <p aria-live="polite" className="mt-2 text-xs font-bold text-zinc-600">
          {progress}
        </p>
      ) : null}
    </div>
  );
}
