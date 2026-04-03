/**
 * patch-routes-new-places.ts
 *
 * Adiciona Martin Holandesa (2613), Lago do Holandês (2614) e
 * Moinho Povos Unidos (2616) aos roteiros relevantes de Holambra.
 *
 * Regras:
 * - Nunca remove lugares existentes
 * - Adiciona apenas onde faz sentido editorial
 * - Ordena logicamente no fluxo do dia
 * - Atualiza placeNotes e highlights com texto curado
 *
 * Run: npx tsx scripts/patch-routes-new-places.ts
 */

import mysql2 from "mysql2/promise";

// ─── IDs dos novos lugares ────────────────────────────────────────────────────
const MARTIN = 2613;  // Martin Holandesa Confeitaria e Restaurante
const LAGO = 2614;    // Lago do Holandês
const MOINHO = 2616;  // Moinho Povos Unidos

// ─── Patches por rota ─────────────────────────────────────────────────────────

/**
 * Rota 1 — Holambra em 1 Dia (Clássico)
 * Atual: [27, 24, 32, 43]
 * Adições: Martin Holandesa (manhã/alternativa almoço) + Moinho (pós-almoço, foto ícone)
 * Nova ordem: [27, 2613, 24, 2616, 32, 43]
 */
const ROTA_1 = {
  id: 1,
  newPlaceIds: [27, 2613, 24, 2616, 32, 43],
  newNotes: {
    [MARTIN]: "Um clássico que merece uma parada logo cedo. A Martin Holandesa é parte do imaginário de Holambra — confeitaria fina, culinária holandesa e ambiente que já é programa em si. Ótima pedida antes do almoço ou como segunda opção gastronômica do dia.",
    [MOINHO]: "Impossível passar por Holambra sem parar aqui. O Moinho Povos Unidos é o cartão-postal da cidade — parada obrigatória depois do almoço para a foto que define qualquer visita. Reserve uns 20 minutos e aproveite a luz.",
  },
  newHighlights: [
    "Martin Holandesa: o ponto mais icônico da culinária holandesa no Boulevard — leve um strombolinha ou experimente um doce típico antes de seguir o roteiro.",
    "Moinho Povos Unidos: a foto obrigatória. Depois do almoço, é o momento perfeito de luz e ritmo para o cartão-postal de Holambra.",
  ],
};

/**
 * Rota 2 — Holambra Romântica (Romântico)
 * Atual: [30, 27, 19, 25]
 * Adições: Lago do Holandês (almoço romântico com vista) + Moinho (foto icônica a dois)
 * Nova ordem: [30, 27, 2614, 19, 2616, 25]
 */
const ROTA_2 = {
  id: 2,
  newPlaceIds: [30, 27, 2614, 19, 2616, 25],
  newNotes: {
    [LAGO]: "O cenário que muda o tom do dia. Vista para o lago, cozinha cuidada e aquela luz de fim de tarde que transforma qualquer almoço numa experiência especial. Imperdível para um roteiro a dois.",
    [MOINHO]: "Um ícone que fica ainda mais bonito a dois. O Moinho Povos Unidos é o pano de fundo perfeito para a foto mais marcante do roteiro — aproveite a luz da tarde para o melhor clique.",
  },
  newHighlights: [
    "Lago do Holandês: o almoço com mais alma do roteiro. Vista para a água, cozinha de qualidade e aquele silêncio agradável que só lugares assim têm.",
    "Moinho Povos Unidos: a foto a dois que define Holambra. Com a luz certa, é o registro mais especial da viagem.",
  ],
};

/**
 * Rota 4 — Holambra Clássica (Clássico)
 * Atual: [2, 19, 32, 24, 44]
 * Adições: Moinho Povos Unidos (ícone clássico, parada cultural)
 * Nova ordem: [2, 19, 2616, 32, 24, 44]
 */
const ROTA_4 = {
  id: 4,
  newPlaceIds: [2, 19, 2616, 32, 24, 44],
  newNotes: {
    [MOINHO]: "O símbolo mais reconhecível de Holambra. Em qualquer roteiro clássico da cidade, o Moinho Povos Unidos é parada obrigatória — para fotografia, para contexto histórico e para absorver de verdade a identidade da cidade.",
  },
  newHighlights: [
    "Moinho Povos Unidos: o ícone que nenhum roteiro clássico pode ignorar. Entre o Van Gogh e o Bloemen Park, é a parada que ancora o dia em Holambra.",
  ],
};

/**
 * Rota 5 — Sabores de Holambra (Gastronômico)
 * Atual: [27, 25, 39, 43]
 * Adições: Martin Holandesa (culinária holandesa autêntica) + Lago do Holandês (experiência gastronômica com vista)
 * Nova ordem: [27, 2613, 2614, 25, 39, 43]
 */
const ROTA_5 = {
  id: 5,
  newPlaceIds: [27, 2613, 2614, 25, 39, 43],
  newNotes: {
    [MARTIN]: "A escolha mais autêntica para quem veio provar Holambra. Confeitaria fina, culinária holandesa com qualidade e aquele ritmo de lugar com história — o complemento perfeito para o café da manhã deste roteiro.",
    [LAGO]: "A vista já vale a visita — e a cozinha confirma. O Lago do Holandês combina gastronomia com experiência de lugar, o que é raro em uma cidade pequena. Perfeito para o almoço do roteiro gastronômico.",
  },
  newHighlights: [
    "Martin Holandesa: o sabor mais típico de Holambra. Culinária holandesa autêntica, confeitaria e um ambiente que sintetiza a identidade gastronômica da cidade.",
    "Lago do Holandês: gastronomia com experiência completa. A combinação de cozinha de qualidade e vista para o lago transforma qualquer refeição em destino.",
  ],
};

/**
 * Rota 7 — Pôr do Sol & Fotos (Fotografia)
 * Atual: [34, 32, 19, 44]
 * Adições: Moinho Povos Unidos (ícone fotográfico) + Lago do Holandês (reflexo na água, luz dourada)
 * Nova ordem: [34, 32, 2616, 2614, 19, 44]
 */
const ROTA_7 = {
  id: 7,
  newPlaceIds: [34, 32, 2616, 2614, 19, 44],
  newNotes: {
    [MOINHO]: "O pano de fundo mais icônico de Holambra. Com a luz certa do fim de tarde, o Moinho Povos Unidos entrega a foto que define qualquer galeria sobre a cidade — clássico, limpo e com personalidade.",
    [LAGO]: "A melhor combinação de luz e cenário do roteiro. O reflexo da água e o ambiente do Lago do Holandês criam aquele tipo de foto que você não encontra em mais nenhum lugar da cidade.",
  },
  newHighlights: [
    "Moinho Povos Unidos: a foto-símbolo de Holambra. No roteiro fotográfico, é parada obrigatória — especialmente com a luz dourada da tarde.",
    "Lago do Holandês: reflexo na água, luz baixa e uma cena que fotografa como poucas em Holambra. Ideal para o fim do dia.",
  ],
};

/**
 * Rota 8 — Fim de Semana em Holambra (Relaxante)
 * Atual: [30, 27, 32, 25, 43]
 * Adições: Martin Holandesa (almoço de sábado, clássico) + Moinho (passeio ícone, must-see)
 * Nova ordem: [30, 27, 2613, 2616, 32, 25, 43]
 */
const ROTA_8 = {
  id: 8,
  newPlaceIds: [30, 27, 2613, 2616, 32, 25, 43],
  newNotes: {
    [MARTIN]: "O almoço de sábado que Holambra merece. A Martin Holandesa tem aquele clima de lugar que existe há anos na cidade — culinária holandesa, confeitaria e ambiente acolhedor para uma refeição sem pressa.",
    [MOINHO]: "O símbolo de Holambra. No fim de semana, é a parada que todo visitante precisa fazer — para foto, para contexto e para sentir de vez o espírito da cidade. Reserve uma tarde.",
  },
  newHighlights: [
    "Martin Holandesa: o almoço mais típico do fim de semana. Um clássico de Holambra que combina culinária holandesa, confeitaria e ambiente de lugar com identidade.",
    "Moinho Povos Unidos: parada obrigatória do fim de semana. A foto aqui é o registro mais simbólico de qualquer visita a Holambra.",
  ],
};

const ALL_PATCHES = [ROTA_1, ROTA_2, ROTA_4, ROTA_5, ROTA_7, ROTA_8];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("🌷 Patcheando roteiros com novos lugares...\n");

  const conn = await mysql2.createConnection(process.env.DATABASE_URL!);
  let updated = 0;
  let errors = 0;

  for (const patch of ALL_PATCHES) {
    try {
      // 1. Read current route
      const [rows]: any = await conn.execute(
        "SELECT id, title, CAST(placeIds AS CHAR) as pids, CAST(highlights AS CHAR) as hl, CAST(placeNotes AS CHAR) as pn FROM routes WHERE id = ?",
        [patch.id]
      );
      const route = rows[0];
      if (!route) { console.error(`  ❌ Rota ${patch.id} não encontrada`); errors++; continue; }

      // 2. Parse current values
      const currentIds: number[] = JSON.parse(route.pids || "[]");
      const currentNotes: Record<string, string> = JSON.parse(route.pn || "{}");
      const currentHighlights: string[] = JSON.parse(route.hl || "[]");

      // 3. Build new values (deduplicated, preserve existing)
      const idsSet = new Set(currentIds);
      patch.newPlaceIds.forEach(id => idsSet.add(id));
      // Respect the ordering from patch.newPlaceIds (it's the desired final order)
      const finalIds = patch.newPlaceIds.filter(id => idsSet.has(id));
      // Add any IDs that exist in current but not in patch order
      currentIds.forEach(id => { if (!finalIds.includes(id)) finalIds.push(id); });

      const finalNotes = { ...currentNotes, ...patch.newNotes };
      const finalHighlights = [...currentHighlights, ...patch.newHighlights];

      // 4. Update DB
      await conn.execute(
        "UPDATE routes SET placeIds = ?, placeNotes = ?, highlights = ?, updatedAt = NOW() WHERE id = ?",
        [
          JSON.stringify(finalIds),
          JSON.stringify(finalNotes),
          JSON.stringify(finalHighlights),
          patch.id,
        ]
      );

      const added = patch.newPlaceIds.filter(id => !currentIds.includes(id));
      console.log(`  ✅ [${patch.id}] ${route.title}`);
      console.log(`     Adicionados: [${added.join(", ")}]`);
      console.log(`     Nova ordem: [${finalIds.join(", ")}]`);
      updated++;
    } catch (err: any) {
      console.error(`  ❌ Erro na rota ${patch.id}: ${err.message}`);
      errors++;
    }
  }

  await conn.end();
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Roteiros atualizados: ${updated}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`${"─".repeat(50)}`);
  process.exit(errors > 0 ? 1 : 0);
}

run().catch(err => { console.error("❌ Falha:", err); process.exit(1); });
