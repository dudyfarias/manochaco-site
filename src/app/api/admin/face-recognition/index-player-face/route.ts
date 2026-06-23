import { NextResponse } from "next/server";
import { canManagePhotos, getAdminContext } from "@/lib/auth";
import { indexPlayerFace } from "@/lib/face-recognition/index-player-face";
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
    return NextResponse.json({ error: "Sem permissão para gerenciar fotos." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { playerFaceReferenceId?: unknown };

    if (!isValidUuid(body.playerFaceReferenceId)) {
      return NextResponse.json({ error: "Referência facial inválida." }, { status: 400 });
    }

    const result = await indexPlayerFace(body.playerFaceReferenceId, context);
    return NextResponse.json({
      ok: true,
      provider: result.provider,
      providerFaceId: result.providerFaceId,
    });
  } catch (error) {
    console.error("[face-recognition] Erro ao indexar referência", error);
    return NextResponse.json(
      { error: toPublicFaceRecognitionError(error) },
      { status: 422 },
    );
  }
}
