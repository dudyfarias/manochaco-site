import { NextResponse } from "next/server";
import { canManagePhotos, getAdminContext } from "@/lib/auth";
import { processGalleryPhoto } from "@/lib/face-recognition/process-photo";
import { toPublicFaceRecognitionError } from "@/lib/face-recognition";

export const runtime = "nodejs";
export const maxDuration = 60;
import { isSameOriginMutation, isValidUuid } from "@/lib/security/admin-request";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Origem da requisição não autorizada." }, { status: 403 });
  }

  const context = await getAdminContext();

  if (!context) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!canManagePhotos(context.profile.role)) {
    return NextResponse.json({ error: "Sem permissão para processar fotos." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { photoId?: unknown };

    if (!isValidUuid(body.photoId)) {
      return NextResponse.json({ error: "Foto inválida." }, { status: 400 });
    }

    const result = await processGalleryPhoto(
      body.photoId,
      context,
      new URL(request.url).origin,
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[face-recognition] Erro ao processar foto", error);
    return NextResponse.json(
      { error: toPublicFaceRecognitionError(error) },
      { status: 422 },
    );
  }
}
