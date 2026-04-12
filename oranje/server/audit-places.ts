/**
 * audit-places.ts
 * Auditoria de qualidade de dados dos lugares no banco.
 * Uso: DATABASE_URL=mysql://... npx tsx server/audit-places.ts
 * Ou: cd oranje && npx tsx server/audit-places.ts
 */

import { getDb } from "./db";

const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

function ok(msg: string) { console.log(`  ${ANSI.green}✅${ANSI.reset} ${msg}`); }
function warn(msg: string) { console.log(`  ${ANSI.yellow}⚠️${ANSI.reset}  ${msg}`); }
function err(msg: string) { console.log(`  ${ANSI.red}❌${ANSI.reset} ${msg}`); }

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("❌ DATABASE_URL não configurado.");
    process.exit(1);
  }

  console.log(`\n${ANSI.bold}${ANSI.cyan}🔍 Auditoria de Lugares — Oranje${ANSI.reset}\n`);

  const [rows] = await db.execute(`
    SELECT id, name, slug, address, lat, lng, coverImage, dataPending,
           isRecommended, isFeatured, status, phone, openingHours,
           shortDesc, longDesc
    FROM places
    WHERE status = 'active'
    ORDER BY isRecommended DESC, isFeatured DESC, dataPending ASC, name ASC
  `) as any;

  const all = rows as any[];
  const published = all.filter((p: any) => !p.dataPending);
  const pending = all.filter((p: any) => p.dataPending);

  console.log(`${ANSI.bold}Total: ${all.length} lugares${ANSI.reset} (${published.length} publicados, ${pending.length} rascunhos)\n`);

  // ── Issues por categoria ──────────────────────────────────────────────────

  const issues: { id: number; name: string; problems: string[] }[] = [];

  for (const p of all) {
    const problems: string[] = [];
    const isPub = !p.dataPending;

    if (!p.coverImage) problems.push("sem coverImage");
    if (!p.lat || !p.lng) problems.push("sem coordenadas (lat/lng)");

    const addr = p.address ?? "";
    if (!addr || addr.includes("Holambra – SP") && addr.length < 30) {
      problems.push(`endereço genérico: "${addr || "vazio"}"`);
    }
    if (!p.shortDesc) problems.push("sem shortDesc");
    if (!p.phone && isPub) problems.push("sem telefone (publicado)");
    if (!p.openingHours && isPub) problems.push("sem horário (publicado)");

    if (problems.length > 0) {
      issues.push({ id: p.id, name: p.name, problems });
    }
  }

  // ── Sumário por severidade ────────────────────────────────────────────────

  const criticalFields = ["sem coverImage", "sem coordenadas", "endereço genérico"];
  const critical = issues.filter(i => i.problems.some(p => criticalFields.some(c => p.includes(c))));
  const warnings = issues.filter(i => !i.problems.some(p => criticalFields.some(c => p.includes(c))));
  const clean = all.filter(p => !issues.find(i => i.id === p.id));

  console.log(`${ANSI.bold}📊 Resumo${ANSI.reset}`);
  console.log(`  ${ANSI.green}✅ Sem problemas: ${clean.length}${ANSI.reset}`);
  console.log(`  ${ANSI.yellow}⚠️  Atenção: ${warnings.length}${ANSI.reset}`);
  console.log(`  ${ANSI.red}❌ Crítico: ${critical.length}${ANSI.reset}\n`);

  // ── Publicados com problemas ──────────────────────────────────────────────

  const pubIssues = issues.filter(i => !all.find(p => p.id === i.id)?.dataPending);
  if (pubIssues.length > 0) {
    console.log(`${ANSI.bold}${ANSI.red}🚨 Publicados com problemas (${pubIssues.length})${ANSI.reset}`);
    for (const i of pubIssues) {
      console.log(`  ${ANSI.bold}[${i.id}] ${i.name}${ANSI.reset}`);
      for (const p of i.problems) {
        if (criticalFields.some(c => p.includes(c))) {
          err(p);
        } else {
          warn(p);
        }
      }
    }
    console.log();
  }

  // ── Rascunhos com problemas ───────────────────────────────────────────────

  const pendIssues = issues.filter(i => all.find(p => p.id === i.id)?.dataPending);
  if (pendIssues.length > 0) {
    console.log(`${ANSI.bold}${ANSI.yellow}📋 Rascunhos com problemas (${pendIssues.length})${ANSI.reset}`);
    for (const i of pendIssues) {
      console.log(`  ${ANSI.dim}[${i.id}] ${i.name}${ANSI.reset}`);
      for (const p of i.problems) {
        console.log(`  ${ANSI.dim}  • ${p}${ANSI.reset}`);
      }
    }
    console.log();
  }

  // ── Lugares sem nenhum problema ───────────────────────────────────────────

  if (clean.length > 0) {
    console.log(`${ANSI.bold}${ANSI.green}✅ Lugares completos (${clean.length})${ANSI.reset}`);
    for (const p of clean) {
      ok(`[${p.id}] ${p.name}${p.dataPending ? " (rascunho)" : ""}`);
    }
    console.log();
  }

  // ── Sem fotos ─────────────────────────────────────────────────────────────

  const noPhoto = published.filter((p: any) => !p.coverImage);
  if (noPhoto.length > 0) {
    console.log(`${ANSI.bold}📷 Publicados sem foto (${noPhoto.length})${ANSI.reset}`);
    for (const p of noPhoto) {
      console.log(`  [${p.id}] ${p.name}`);
    }
    console.log();
  }

  // ── Sem coordenadas ───────────────────────────────────────────────────────

  const noCoords = published.filter((p: any) => !p.lat || !p.lng);
  if (noCoords.length > 0) {
    console.log(`${ANSI.bold}📍 Publicados sem coordenadas (${noCoords.length})${ANSI.reset}`);
    for (const p of noCoords) {
      console.log(`  [${p.id}] ${p.name}`);
    }
    console.log();
  }

  console.log(`${ANSI.dim}─────────────────────────────────────────${ANSI.reset}`);
  console.log(`${ANSI.bold}Auditoria concluída.${ANSI.reset}\n`);

  await (db as any).$client?.end?.();
  process.exit(0);
}

main().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
