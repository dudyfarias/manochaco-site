import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceEnv } from "../src/lib/supabase/env";
import { createSupabaseServiceClient } from "../src/lib/supabase/service";

const requiredTables = [
  "players",
  "competitions",
  "seasons",
  "matches",
  "player_match_stats",
  "player_aliases",
  "player_competition_stats",
  "player_historical_stats",
  "albums",
  "photos",
  "photo_player_tags",
  "player_face_references",
  "player_face_embeddings",
  "face_detection_suggestions",
  "admin_profiles",
  "member_profiles",
  "audit_logs",
  "financial_categories",
  "financial_transactions",
  "player_monthly_fees",
  "sponsors",
  "sponsorship_contracts",
];

const privateTables = [
  "player_aliases",
  "player_historical_stats",
  "player_face_references",
  "player_face_embeddings",
  "face_detection_suggestions",
  "member_profiles",
  "financial_transactions",
  "player_monthly_fees",
];

const requiredBuckets = [
  "logos",
  "team",
  "players",
  "photos",
  "albums",
  "face-references",
];

function fail(message: string) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function pass(message: string) {
  console.log(`✓ ${message}`);
}

async function validateTable(table: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) {
    fail(`Tabela ${table}: ${error.message}`);
    return;
  }

  pass(`Tabela ${table} acessível via service role`);
}

async function validatePublicCount(table: string, label: string) {
  const { url, anonKey } = getSupabasePublicEnv();

  if (!url || !anonKey) {
    fail("NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente.");
    return;
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) {
    fail(`${label}: ${error.message}`);
    return;
  }

  if (!count || count < 1) {
    fail(`${label}: nenhum registro encontrado.`);
    return;
  }

  pass(`${label}: ${count} registro(s) público(s)`);
}

async function validatePrivateTable(table: string) {
  const { url, anonKey } = getSupabasePublicEnv();

  if (!url || !anonKey) {
    return;
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.from(table).select("id").limit(1);

  if (!error && data && data.length > 0) {
    fail(`Tabela privada ${table} retornou dados para anon.`);
    return;
  }

  pass(`Tabela privada ${table} não expõe dados para anon`);
}

async function validateBuckets() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    fail(`Buckets: ${error.message}`);
    return;
  }

  const bucketIds = new Set((data ?? []).map((bucket) => bucket.id));

  requiredBuckets.forEach((bucket) => {
    if (bucketIds.has(bucket)) {
      pass(`Bucket ${bucket} encontrado`);
    } else {
      fail(`Bucket ${bucket} não encontrado`);
    }
  });
}

async function validateFaceRecognitionEnv() {
  const provider = process.env.FACE_RECOGNITION_PROVIDER?.trim() || "insightface";
  const confidence = Number(
    process.env.FACE_RECOGNITION_MIN_CONFIDENCE?.trim() || "0.75",
  );
  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
  const maxDistance = Number(
    process.env.FACE_RECOGNITION_MAX_DISTANCE?.trim() || "0.6",
  );

  if (!["insightface", "faceapi", "aws", "mock"].includes(provider)) {
    fail(`FACE_RECOGNITION_PROVIDER não implementado: ${provider}.`);
  } else {
    pass(`Provider de reconhecimento facial configurado como ${provider}`);
  }

  if (provider !== "insightface") {
    fail(`Produção deve usar FACE_RECOGNITION_PROVIDER=insightface; recebido ${provider}.`);
  } else {
    const apiUrl = process.env.FACE_RECOGNITION_API_URL?.trim();
    const apiKey = process.env.FACE_RECOGNITION_API_KEY?.trim();
    if (!apiUrl || !apiKey) {
      fail("FACE_RECOGNITION_API_URL ou FACE_RECOGNITION_API_KEY ausente.");
    } else {
      try {
        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health`, {
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) {
          fail(`Health do InsightFace retornou HTTP ${response.status}.`);
        } else {
          const health = (await response.json()) as { ok?: boolean; model?: string };
          if (health.ok) pass(`InsightFace disponível com modelo ${health.model ?? "não informado"}`);
          else fail("Health do InsightFace não confirmou disponibilidade.");
        }
      } catch (error) {
        fail(`InsightFace indisponível: ${error instanceof Error ? error.message : "erro de rede"}`);
      }
    }
  }

  const batchLimit = Number(process.env.FACE_RECOGNITION_BATCH_LIMIT?.trim() || "5");
  if (!Number.isInteger(batchLimit) || batchLimit < 1 || batchLimit > 20) {
    fail("FACE_RECOGNITION_BATCH_LIMIT deve estar entre 1 e 20.");
  } else {
    pass(`Lote facial limitado a ${batchLimit} foto(s)`);
  }

  if (provider === "aws") {
    for (const key of [
      "AWS_REGION",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_REKOGNITION_COLLECTION_ID",
    ]) {
      if (process.env[key]) {
        pass(`${key} configurada`);
      } else {
        fail(`${key} não configurada.`);
      }
    }
  }

  if (!Number.isFinite(normalizedConfidence) || normalizedConfidence < 0 || normalizedConfidence > 1) {
    fail("FACE_RECOGNITION_MIN_CONFIDENCE deve estar entre 0 e 1, ou usar percentual.");
  } else {
    pass(`Confiança mínima configurada em ${Math.round(normalizedConfidence * 100)}%`);
  }

  if (!Number.isFinite(maxDistance) || maxDistance <= 0 || maxDistance > 2) {
    fail("FACE_RECOGNITION_MAX_DISTANCE deve estar acima de 0 e até 2.");
  } else {
    pass(`Distância facial máxima configurada em ${maxDistance}`);
  }

  if (provider === "faceapi") {
    const modelFiles = [
      "tiny_face_detector_model-weights_manifest.json",
      "tiny_face_detector_model.bin",
      "face_landmark_68_model-weights_manifest.json",
      "face_landmark_68_model.bin",
      "face_recognition_model-weights_manifest.json",
      "face_recognition_model.bin",
    ];
    const missingModels = modelFiles.filter(
      (file) => !existsSync(path.join(process.cwd(), "public", "models", "face-api", file)),
    );

    if (missingModels.length > 0) {
      missingModels.forEach((file) => fail(`Modelo face-api ausente: ${file}`));
    } else {
      pass("Modelos face-api encontrados");
    }
  }

  if (process.env.FACE_RECOGNITION_AUTO_APPROVE?.toLowerCase() === "true") {
    fail("FACE_RECOGNITION_AUTO_APPROVE deve permanecer false.");
  } else {
    pass("Aprovação automática desativada");
  }
}

async function validateFaceRecognitionSchema() {
  const supabase = createSupabaseServiceClient();
  const { error: referenceError } = await supabase
    .from("player_face_references")
    .select("id, storage_path, provider_face_id, embedding, embedding_model, embedding_generated_at, indexing_status, indexed_at")
    .limit(1);
  const { error: suggestionError } = await supabase
    .from("face_detection_suggestions")
    .select("id, provider, provider_face_id, raw_response, status")
    .limit(1);
  const { error: embeddingError } = await supabase
    .from("player_face_embeddings")
    .select("id, player_id, face_reference_id, embedding_model, provider, consent_given, approved_for_recognition")
    .limit(1);

  if (referenceError) {
    fail(`Schema de referências faciais: ${referenceError.message}`);
  } else {
    pass("Schema de referências faciais atualizado");
  }

  if (suggestionError) {
    fail(`Schema de sugestões faciais: ${suggestionError.message}`);
  } else {
    pass("Schema de sugestões faciais atualizado");
  }

  if (embeddingError) {
    fail(`Schema de embeddings faciais: ${embeddingError.message}`);
  } else {
    pass("Schema privado de embeddings faciais atualizado");
  }
}

async function main() {
  console.log("Validação de produção - Manochaco");

  const publicEnv = getSupabasePublicEnv();
  const serviceEnv = getSupabaseServiceEnv();

  if (!publicEnv.isConfigured) {
    fail("Variáveis públicas do Supabase não configuradas.");
  } else {
    pass("Variáveis públicas do Supabase configuradas");
  }

  if (!serviceEnv.isConfigured) {
    fail("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  } else {
    pass("Service role configurada para scripts server-side");
  }

  if (!publicEnv.isConfigured || !serviceEnv.isConfigured) {
    process.exit(1);
  }

  await validateFaceRecognitionEnv();

  for (const table of requiredTables) {
    await validateTable(table);
  }

  await validatePublicCount("players", "Jogadores públicos");
  await validatePublicCount("competitions", "Campeonatos públicos");
  await validateBuckets();
  await validateFaceRecognitionSchema();

  for (const table of privateTables) {
    await validatePrivateTable(table);
  }

  const exitCode = typeof process.exitCode === "number" ? process.exitCode : 0;
  if (exitCode > 0) {
    process.exit(exitCode);
  }

  console.log("Validação concluída.");
}

main().catch((error) => {
  console.error("Falha na validação de produção:");
  console.error(error);
  process.exit(1);
});
