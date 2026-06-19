import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceEnv } from "../src/lib/supabase/env";
import { createSupabaseServiceClient } from "../src/lib/supabase/service";

const requiredTables = [
  "players",
  "competitions",
  "seasons",
  "matches",
  "player_match_stats",
  "albums",
  "photos",
  "photo_player_tags",
  "player_face_references",
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
  "player_face_references",
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

function validateFaceRecognitionEnv() {
  const provider = process.env.FACE_RECOGNITION_PROVIDER;
  const confidence = Number(process.env.FACE_RECOGNITION_MIN_CONFIDENCE ?? "80");

  if (provider !== "aws") {
    fail("FACE_RECOGNITION_PROVIDER deve ser aws em produção.");
  } else {
    pass("Provider de reconhecimento facial configurado como AWS");
  }

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

  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    fail("FACE_RECOGNITION_MIN_CONFIDENCE deve estar entre 0 e 100.");
  } else {
    pass(`Confiança mínima configurada em ${confidence}%`);
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
    .select("id, storage_path, provider_face_id, indexing_status, indexed_at")
    .limit(1);
  const { error: suggestionError } = await supabase
    .from("face_detection_suggestions")
    .select("id, provider, provider_face_id, raw_response, status")
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

  validateFaceRecognitionEnv();

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
