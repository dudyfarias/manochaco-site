"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProcessPendingPhotosButton({
  photoIds,
  provider,
  batchLimit,
}: {
  photoIds: string[];
  provider: string;
  batchLimit: number;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState("");
  const [pending, setPending] = useState(false);

  async function processPending() {
    setPending(true);
    const selectedPhotoIds = photoIds.slice(0, batchLimit);
    let completed = 0;
    let withSuggestions = 0;
    let withoutFaces = 0;
    let errors = 0;

    try {
      for (const photoId of selectedPhotoIds) {
        setProgress(`Processando ${completed + errors + 1} de ${selectedPhotoIds.length}...`);
        try {
          const response = await fetch("/api/admin/face-recognition/process-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photoId }),
          });
          const result = (await response.json()) as {
            error?: string;
            detectedFaces?: number;
            suggestions?: number;
          };

          if (!response.ok) {
            errors += 1;
            continue;
          }
          completed += 1;
          if ((result.suggestions ?? 0) > 0) withSuggestions += 1;
          if ((result.detectedFaces ?? 0) === 0) withoutFaces += 1;
        } catch {
          errors += 1;
        }
      }
      setProgress(
        `Processadas: ${completed} · com sugestões: ${withSuggestions} · sem rosto: ${withoutFaces} · erros: ${errors}`,
      );
      router.refresh();
    } catch (error) {
      setProgress(
        `Falha na fila após ${completed} foto(s): ${error instanceof Error ? error.message : "falha de rede"}`,
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
        {pending
          ? "Processando fila..."
          : `Processar pendentes (${Math.min(photoIds.length, batchLimit)})`}
      </button>
      <p className="mt-2 text-xs font-bold text-zinc-500">
        Provider: {provider} · limite por execução: {batchLimit}
      </p>
      {progress ? (
        <p aria-live="polite" className="mt-2 text-xs font-bold text-zinc-600">
          {progress}
        </p>
      ) : null}
    </div>
  );
}
