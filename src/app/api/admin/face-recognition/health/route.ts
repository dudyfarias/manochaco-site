import { NextResponse } from "next/server";
import { canManagePhotos, getAdminContext } from "@/lib/auth";
import {
  getFaceRecognitionProvider,
  toPublicFaceRecognitionError,
} from "@/lib/face-recognition";
import { isSameOriginMutation } from "@/lib/security/admin-request";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Origem da requisição não autorizada." }, { status: 403 });
  }
  const context = await getAdminContext();
  if (!context) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!canManagePhotos(context.profile.role)) {
    return NextResponse.json({ error: "Sem permissão para testar o serviço." }, { status: 403 });
  }

  try {
    const provider = await getFaceRecognitionProvider();
    if (!provider.health) {
      return NextResponse.json(
        { error: `O provider ${provider.name} não expõe diagnóstico de saúde.` },
        { status: 422 },
      );
    }
    return NextResponse.json(await provider.health());
  } catch (error) {
    console.error("[face-recognition] Falha no health check", error);
    return NextResponse.json(
      { error: toPublicFaceRecognitionError(error) },
      { status: 503 },
    );
  }
}
