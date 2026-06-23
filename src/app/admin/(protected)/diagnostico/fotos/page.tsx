import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminButtonLink,
  AdminCard,
  AdminPageTitle,
} from "@/components/admin/AdminUI";
import { listPhotoDiagnostics } from "@/lib/admin/data";
import { faceRecognitionStatusLabels } from "@/lib/photos";
import type { FaceRecognitionStatus } from "@/types";

export const metadata: Metadata = {
  title: "Admin - Diagnóstico de fotos",
};

export default async function PhotoDiagnosticsPage() {
  const photos = await listPhotoDiagnostics();

  return (
    <div>
      <AdminPageTitle
        eyebrow="Diagnóstico"
        title="Pipeline de fotos"
        description="Todas as fotos cadastradas no banco, seus vínculos e o motivo de entrarem ou não na fila de reconhecimento."
        action={
          <AdminButtonLink href="/admin/reconhecimento-facial" tone="secondary">
            Voltar
          </AdminButtonLink>
        }
      />

      <AdminCard className="mt-6 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Álbum</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sugestões</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Na fila</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {photos.map((photo) => (
                <tr key={photo.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/galeria/fotos/${photo.id}`}
                      className="font-black text-zinc-950 hover:text-[#9a6a12]"
                    >
                      {photo.title}
                    </Link>
                    <p className="mt-1 max-w-64 truncate text-xs text-zinc-500">
                      {photo.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{photo.id}</td>
                  <td className="px-4 py-3 text-zinc-600">{photo.albumTitle ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-600">{photo.category}</td>
                  <td className="px-4 py-3 font-bold text-zinc-800">
                    {faceRecognitionStatusLabels[
                      photo.face_recognition_status as FaceRecognitionStatus
                    ] ?? photo.face_recognition_status}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {photo.suggestionCount} ({photo.pendingSuggestionCount} pendentes)
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{photo.confirmedTagCount}</td>
                  <td className="px-4 py-3 font-black">
                    {photo.appearsInQueue ? "Sim" : "Não"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{photo.queueReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
