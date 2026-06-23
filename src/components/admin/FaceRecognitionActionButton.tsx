"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FaceRecognitionActionButtonProps = {
  endpoint: string;
  payload: Record<string, string>;
  label: string;
  pendingLabel: string;
  disabled?: boolean;
  confirmationMessage?: string;
};

export function FaceRecognitionActionButton({
  endpoint,
  payload,
  label,
  pendingLabel,
  disabled = false,
  confirmationMessage,
}: FaceRecognitionActionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function run() {
    if (confirmationMessage && !window.confirm(confirmationMessage)) return;

    setPending(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Não foi possível concluir a operação.");
      }

      setMessage("Operação concluída.");
      router.refresh();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Falha inesperada.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={disabled || pending}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-4 py-2 text-sm font-black text-black transition hover:bg-[#f0c35d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? pendingLabel : label}
      </button>
      {message ? (
        <p
          aria-live="polite"
          className={`mt-2 text-xs font-bold ${isError ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
