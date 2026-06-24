import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "../src/lib/supabase/env";

const publicFiles = [
  "src/app/page.tsx",
  "src/app/estatisticas/page.tsx",
  "src/app/jogadores/page.tsx",
  "src/app/jogadores/[slug]/page.tsx",
];

async function main() {
  let failures = 0;

  for (const file of publicFiles) {
    const content = await fs.readFile(file, "utf8");
    if (/from\s+["']@\/data/.test(content)) {
      failures += 1;
      console.error(`✗ ${file} importa dados locais diretamente`);
    } else {
      console.log(`✓ ${file} usa a camada central de dados`);
    }
  }

  const dataLayer = await fs.readFile("src/lib/data.ts", "utf8");
  if (!dataLayer.includes('.from("player_competition_stats")')) {
    failures += 1;
    console.error("✗ A camada pública não consulta player_competition_stats");
  } else {
    console.log("✓ A camada pública consulta player_competition_stats");
  }

  const providerLayer = await fs.readFile("src/lib/face-recognition/provider.ts", "utf8");
  const providerFactory = await fs.readFile("src/lib/face-recognition/index.ts", "utf8");
  if (!providerLayer.includes('return "insightface"')) {
    failures += 1;
    console.error("✗ InsightFace não é o provider padrão");
  } else {
    console.log("✓ InsightFace é o provider padrão");
  }
  if (!providerLayer.includes('provider === "mock"') || !providerLayer.includes('NODE_ENV === "production"')) {
    failures += 1;
    console.error("✗ Provider mock não está bloqueado em produção");
  } else {
    console.log("✓ Provider mock está bloqueado em produção");
  }
  if (!providerFactory.includes('import("./insightface-provider")')) {
    failures += 1;
    console.error("✗ Factory não carrega o provider InsightFace");
  } else {
    console.log("✓ Factory carrega o provider InsightFace apenas server-side");
  }

  const env = getSupabasePublicEnv();
  if (env.url && env.anonKey) {
    const supabase = createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { count, error } = await supabase
      .from("player_competition_stats")
      .select("id", { count: "exact", head: true });

    if (error) {
      failures += 1;
      console.error(`✗ Supabase não expôs estatísticas públicas: ${error.message}`);
    } else if (!count) {
      failures += 1;
      console.error("✗ Supabase não possui estatísticas granulares");
    } else {
      console.log(`✓ Supabase possui ${count} linhas granulares públicas`);
    }
  } else {
    console.warn("! Supabase não configurado; auditoria remota não executada");
  }

  if (failures > 0) process.exit(1);
}

void main();
