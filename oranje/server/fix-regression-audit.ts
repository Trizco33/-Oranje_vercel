/**
 * fix-regression-audit.ts
 * Auditoria completa de regressão — corrige:
 * 1. site_pages "melhores-restaurantes-de-holambra" com conteúdo obsoleto
 *    (remove Deck do Lago inativo, Garden Restaurante inexistente,
 *     corrige "De Immigrant Garden" → nome real, remove Cowburguer da editorial)
 * 2. slugs nulos em lugares ativos (causa links quebrados)
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";

const CORRECTED_HTML = `<p>Holambra surpreende quem chega esperando apenas flores. A cena gastrônomica da cidade cresceu junto com o turismo e hoje oferece experiências de verdade — desde almoços históricos no Boulevard Holandês até cardápios que cruzam culturas brasileiras, holandesas e italianas sem perder a identidade local.</p>
<p>Aqui você não vai encontrar genéricas "opções para todos os gostos". O que existe em Holambra são lugares com história, ingredientes frescos e cozinheiros que conhecem seus clientes pelo nome.</p>
<h2>Onde comer bem em Holambra</h2>
<p>Para um almoço tranquilo com ambiente descontraído, o <a href="/app/lugar/2614">Lago do Holandês</a> é referência. Com cardápio acessível e atmosfera de cidade pequena, é um dos favoritos de quem visita Holambra pela primeira vez — e de quem já volta pela décima.</p>
<p>Quem busca culinária holandesa de verdade encontra no <a href="/app/lugar/2613">Martin Holandesa</a> uma das experiências mais autênticas da cidade — confeitaria e restaurante no Boulevard Holandês, com décadas de história e pratos que carregam a herança holandesa que define o espírito de Holambra.</p>
<p>O <a href="/app/lugar/24">Casa Bela Restaurante</a> é a pedida certa para refeições em família. Ambiente acolhedor, cardápio farto e preço justo — o tipo de lugar que você recomenda sem hesitar.</p>
<h2>Para os que gostam de algo diferente</h2>
<p>O <a href="/app/lugar/36">De Immigrant Gastro Café</a> abre todos os dias a partir das 8h — café da manhã, almoço regional e uma proposta que conta a história dos imigrantes holandeses que fundaram Holambra. Na mesma rua, o <a href="/app/lugar/3824">De Immigrant Restaurante Garden</a> amplia essa experiência com cardápio autoral em ambiente garden.</p>
<p>Para hambúrguer artesanal de qualidade, o <a href="/app/lugar/13946">Don Hamburgo</a> — na Av. das Tulipas — já está conquistando quem busca uma refeição sólida em Holambra. Cardápio focado e fácil acesso para hóspedes da região central.</p>
<p>Para esfiha e comida árabe num endereço descontraído, a <a href="/app/lugar/13952">Casa da Esfiha</a> é a novidade que cabe bem no roteiro — funcionando diariamente a partir das 17h.</p>
<h2>Dicas de quem conhece</h2>
<p>Holambra tem movimento intenso nos fins de semana e durante a Expoflora. Se for nessas datas, <strong>faça reserva com antecedência</strong> — os restaurantes mais procurados lotam cedo. Na semana, você consegue mesa com mais tranquilidade e muitas vezes um atendimento ainda mais cuidadoso.</p>
<p>O horário de almoço começa cedo — por volta de 11h30 muitos lugares já estão servindo. Aproveite para chegar antes do pico e pedir a recomendação do dia ao garçom. Em Holambra, isso costuma render as melhores surpresas.</p>
<a href="/app/lugar/2613" class="place-card"><div class="place-card-name">Martin Holandesa</div><div class="place-card-desc">Confeitaria e restaurante holandês — referência histórica no Boulevard Holandês</div></a>
<a href="/app/lugar/2614" class="place-card"><div class="place-card-name">Lago do Holandês</div><div class="place-card-desc">Cardápio acessível, atmosfera de cidade pequena — ótimo para almoço</div></a>
<a href="/app/lugar/24" class="place-card"><div class="place-card-name">Casa Bela Restaurante</div><div class="place-card-desc">Ambiente familiar, farto e acolhedor</div></a>
<a href="/app/lugar/25" class="place-card"><div class="place-card-name">Restaurante Villa Girassol</div><div class="place-card-desc">Culinária regional e ambiente agradável no coração de Holambra</div></a>
<a href="/app/lugar/36" class="place-card"><div class="place-card-name">De Immigrant Gastro Café</div><div class="place-card-desc">Café da manhã, almoço e história da imigração holandesa — desde as 8h</div></a>
<a href="/app/lugar/3824" class="place-card"><div class="place-card-name">De Immigrant Restaurante Garden</div><div class="place-card-desc">Cardápio autoral em ambiente garden — vizinho ao Gastro Café</div></a>
<a href="/app/lugar/13946" class="place-card"><div class="place-card-name">Don Hamburgo</div><div class="place-card-desc">Hamburgueria artesanal — Av. das Tulipas, centro de Holambra</div></a>
<a href="/app/lugar/13952" class="place-card"><div class="place-card-name">Casa da Esfiha</div><div class="place-card-desc">Esfiha e opções árabes — aberto diariamente a partir das 17h</div></a>`;

// Lugares ativos com slug nulo que precisam de slug gerado
const SLUGS_TO_FIX: { id: number; slug: string }[] = [
  { id: 4213,  slug: "deck-do-amor" },
  { id: 4214,  slug: "praca-vitoria-regia" },
  { id: 4215,  slug: "rua-dos-guarda-chuvas" },
  { id: 6418,  slug: "fratelli-wine-bar" },
  { id: 6420,  slug: "hana-restaurante-holambra" },
  { id: 6424,  slug: "museu-da-cultura-e-historia-de-holambra" },
  { id: 6432,  slug: "villagrill-hamburgueria-e-bar" },
  { id: 6434,  slug: "di-kome-garage-bistro" },
  { id: 6436,  slug: "houtskool-steak-burger" },
  { id: 6438,  slug: "op-sorvetes-artesanais" },
  { id: 6444,  slug: "em-busca-do-galope" },
  { id: 6446,  slug: "mais-coxinha" },
  { id: 6448,  slug: "kok-holambra-food-truck" },
  { id: 6451,  slug: "villa-milani" },
  { id: 6454,  slug: "sabor-arte" },
  { id: 9740,  slug: "igreja-matriz-do-divino-espirito-santo" },
  { id: 13946, slug: "don-hamburgo" },
  { id: 13948, slug: "fiore-forneria" },
  { id: 13950, slug: "vecchio-onofre" },
  { id: 13952, slug: "casa-da-esfiha" },
  { id: 13954, slug: "italia-no-box-holambra" },
];

async function run() {
  const db = await getDb();
  if (!db) { console.error("[fix] DB indisponível"); process.exit(1); }

  // ── 1. Atualizar site_pages ────────────────────────────────────────────────
  console.log("📄 Corrigindo site_pages 'melhores-restaurantes-de-holambra'...");
  await db.execute(
    sql`UPDATE site_pages SET content = ${CORRECTED_HTML}, updatedAt = NOW() WHERE slug = 'melhores-restaurantes-de-holambra'`
  );

  // Verificar
  const verify = await db.execute(
    sql`SELECT LEFT(content, 120) as preview FROM site_pages WHERE slug = 'melhores-restaurantes-de-holambra'`
  ) as any[];
  const row = (verify as any)[0]?.[0];
  const preview = row?.preview ?? row?.["LEFT(content, 120)"] ?? "N/A";
  console.log(`  ✅ Conteúdo atualizado. Preview: ${String(preview).substring(0,100)}`);

  // Verificar que não há mais referências ruins
  const check = await db.execute(
    sql`SELECT content LIKE '%Deck do Lago%' as hasDeckLago, content LIKE '%Garden Restaurante%' as hasGarden, content LIKE '%/lugar/35%' as has35, content LIKE '%/lugar/6"%' as has6 FROM site_pages WHERE slug = 'melhores-restaurantes-de-holambra'`
  ) as any[];
  console.log("  Verificação de conteúdo obsoleto:", JSON.stringify((check as any)[0]?.[0]));

  // ── 2. Corrigir slugs nulos em lugares ativos ─────────────────────────────
  console.log("\n🔤 Corrigindo slugs nulos em lugares ativos...");
  let fixed = 0;
  for (const { id, slug } of SLUGS_TO_FIX) {
    // Verificar conflito de slug
    const conflict = await db.execute(
      sql`SELECT id FROM places WHERE slug = ${slug} AND id != ${id} LIMIT 1`
    ) as any[];
    if (((conflict as any)[0] as any[]).length > 0) {
      console.log(`  ⚠️  ID ${id}: slug '${slug}' já usado — pulando`);
      continue;
    }
    await db.execute(
      sql`UPDATE places SET slug = ${slug}, updatedAt = NOW() WHERE id = ${id} AND slug IS NULL`
    );
    fixed++;
    console.log(`  ✅ ID ${id} → '${slug}'`);
  }
  console.log(`\n  Total slugs corrigidos: ${fixed}`);

  // ── 3. Relatório final ─────────────────────────────────────────────────────
  console.log("\n🔍 Relatório final:");
  const nullActive = await db.execute(
    sql`SELECT COUNT(*) as cnt FROM places WHERE slug IS NULL AND status = 'active'`
  ) as any[];
  const cnt = ((nullActive as any)[0] as any[])[0];
  console.log(`  Lugares ativos com slug nulo: ${cnt?.cnt ?? cnt?.["COUNT(*)"] ?? "?"}`);

  const dh = await db.execute(
    sql`SELECT id, name, slug, categoryId FROM places WHERE id = 13946`
  ) as any[];
  console.log(`  Don Hamburgo: ${JSON.stringify(((dh as any)[0] as any[])[0])}`);

  const esfiha = await db.execute(
    sql`SELECT id, name, slug FROM places WHERE id = 13952`
  ) as any[];
  console.log(`  Casa da Esfiha: ${JSON.stringify(((esfiha as any)[0] as any[])[0])}`);

  console.log("\n✅ Fix de regressão concluído.");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
