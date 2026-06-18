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
  "admin_profiles",
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

  for (const table of requiredTables) {
    await validateTable(table);
  }

  await validatePublicCount("players", "Jogadores públicos");
  await validatePublicCount("competitions", "Campeonatos públicos");
  await validateBuckets();

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
