/**
 * seed-receptivo.ts
 *
 * Cria as tabelas do Receptivo Oranje e popula o piloto "Holambra Romântica".
 * Idempotente — pode ser executado múltiplas vezes sem duplicar dados.
 *
 * Uso:
 *   DATABASE_URL=mysql://... npx tsx server/seed-receptivo.ts
 */

import { getDb } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { places } from "../drizzle/schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findPlaceId(db: any, name: string, city = "Holambra"): Promise<number | null> {
  const rows = await db
    .select({ id: places.id })
    .from(places)
    .where(and(eq(places.name, name), eq(places.city, city)))
    .limit(1);
  return rows[0]?.id ?? null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("❌ DATABASE_URL não configurado ou banco indisponível.");
    process.exit(1);
  }

  console.log("🌷 Receptivo Oranje — seed iniciado");

  // ── 1. Criar tabelas via SQL direto (idempotente) ───────────────────────────

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS guided_tours (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      slug        VARCHAR(100) NOT NULL UNIQUE,
      name        VARCHAR(255) NOT NULL,
      tagline     VARCHAR(255),
      description TEXT,
      theme       VARCHAR(100),
      duration    VARCHAR(50),
      coverImage  TEXT,
      status      VARCHAR(20) NOT NULL DEFAULT 'draft',
      createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Tabela guided_tours OK");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS guided_tour_stops (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      tourId      INT NOT NULL,
      placeId     INT NOT NULL,
      stopOrder   INT NOT NULL,
      narrative   TEXT,
      tip         TEXT,
      bestMoment  VARCHAR(255),
      createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (tourId)  REFERENCES guided_tours(id),
      FOREIGN KEY (placeId) REFERENCES places(id)
    )
  `);
  console.log("✅ Tabela guided_tour_stops OK");

  // ── 2. Mapear IDs reais dos lugares ─────────────────────────────────────────

  const placeNames = [
    "Rua dos Guarda-Chuvas",
    "Deck do Amor",
    "Praça Vitória Régia",
    "Moinho Povos Unidos",
    "Zoet en Zout",
  ];

  const placeIds: Record<string, number> = {};
  for (const name of placeNames) {
    const id = await findPlaceId(db, name);
    if (id) {
      placeIds[name] = id;
      console.log(`  📍 ${name} → id ${id}`);
    } else {
      console.warn(`  ⚠️  "${name}" não encontrado no banco — parada será ignorada`);
    }
  }

  const foundIds = Object.values(placeIds);
  if (foundIds.length < 3) {
    console.error("❌ Menos de 3 lugares encontrados — abortando seed.");
    process.exit(1);
  }

  // ── 3. Upsert do passeio ─────────────────────────────────────────────────────

  const SLUG = "holambra-romantica";

  const existingTour = await db.execute(
    sql`SELECT id FROM guided_tours WHERE slug = ${SLUG} LIMIT 1`
  );
  const existingRows = (existingTour as any)[0] as any[];

  let tourId: number;

  if (existingRows.length > 0) {
    tourId = existingRows[0].id;
    await db.execute(sql`
      UPDATE guided_tours SET
        name        = 'Holambra Romântica',
        tagline     = 'O percurso mais bonito do centro histórico',
        description = 'Existe um jeito de percorrer Holambra que transforma o passeio em memória. Começa com cor e termina com atmosfera — e no meio do caminho, o lago, os cadeados e o moinho que deu nome à cidade. Este passeio foi desenhado para casais, mas qualquer pessoa que queira entender o coração de Holambra vai encontrar o que procura.',
        theme       = 'Romântico',
        duration    = '2 a 3 horas',
        coverImage  = NULL,
        status      = 'active',
        updatedAt   = NOW()
      WHERE id = ${tourId}
    `);
    console.log(`✅ Passeio atualizado (id ${tourId})`);
  } else {
    const result = await db.execute(sql`
      INSERT INTO guided_tours (slug, name, tagline, description, theme, duration, coverImage, status)
      VALUES (
        ${SLUG},
        'Holambra Romântica',
        'O percurso mais bonito do centro histórico',
        'Existe um jeito de percorrer Holambra que transforma o passeio em memória. Começa com cor e termina com atmosfera — e no meio do caminho, o lago, os cadeados e o moinho que deu nome à cidade. Este passeio foi desenhado para casais, mas qualquer pessoa que queira entender o coração de Holambra vai encontrar o que procura.',
        'Romântico',
        '2 a 3 horas',
        NULL,
        'active'
      )
    `);
    tourId = (result as any)[0].insertId;
    console.log(`✅ Passeio criado (id ${tourId})`);
  }

  // ── 4. Upsert das paradas ────────────────────────────────────────────────────

  const STOPS: Array<{
    name: string;
    order: number;
    narrative: string;
    tip: string | null;
    bestMoment: string | null;
  }> = [
    {
      name: "Rua dos Guarda-Chuvas",
      order: 1,
      narrative:
        "O passeio começa aqui — e começa com cor. A Rua dos Guarda-Chuvas é aquela parada que você não planeja, mas acaba fazendo questão de registrar. Os guarda-chuvas coloridos suspensos criam um corredor festivo no coração do centro, especialmente bonito pela manhã, quando a luz atravessa o tecido e projeta tons suaves na calçada. É o ponto de partida natural do eixo de passeio a pé mais bonito de Holambra — daqui, o lago já chama.",
      tip: "Chegue antes das 10h para a melhor luz e menos movimento.",
      bestMoment: "Manhã cedo",
    },
    {
      name: "Deck do Amor",
      order: 2,
      narrative:
        "Depois da rua, o lago. O Deck do Amor é onde Holambra guarda suas histórias mais silenciosas. Os cadeados presos na cerca não são decoração — são gestos reais de quem passou por aqui e quis deixar alguma coisa. No entardecer, a luz dourada reflete na água, o movimento diminui e o que sobra é exatamente o que um passeio romântico precisa ter: quietude e atmosfera.",
      tip: "Há uma lojinha próxima onde você pode comprar um cadeado para registrar sua passagem.",
      bestMoment: "Final da tarde",
    },
    {
      name: "Praça Vitória Régia",
      order: 3,
      narrative:
        "Uma das paradas mais contemplativas de Holambra. O espelho d'água com vitórias-régias gigantes muda de tom ao longo do dia — ao amanhecer, com névoa leve e luz rasa, é quase irreal. A praça é gratuita, sempre aberta e fica logo ao lado do Deck do Amor, o que torna a transição entre as duas paradas muito natural. Daqui, o Moinho já se avista.",
      tip: null,
      bestMoment: "Amanhecer ou final da tarde",
    },
    {
      name: "Moinho Povos Unidos",
      order: 4,
      narrative:
        "Não tem como terminar de outra forma. O Moinho é o símbolo de Holambra — construído pelos imigrantes holandeses, ele fecha o percurso com uma imagem que fica. A qualquer hora do dia oferece uma boa fotografia, mas é no final da tarde que ele ganha um dourado que justifica qualquer visita. Chegando aqui, o passeio se completa — e Holambra fica registrada do jeito certo.",
      tip: "Para a melhor foto, posicione-se do lado oposto à entrada — a perspectiva abre o campo visual.",
      bestMoment: "Final da tarde",
    },
    {
      name: "Zoet en Zout",
      order: 5,
      narrative:
        "O passeio não precisa terminar no Moinho. A poucos metros dali, o Zoet en Zout espera com café com leite e stroopwafel feito na hora — a versão local do ponto final perfeito. Zoet en Zout significa 'doce e salgado' em holandês, e é exatamente o que você encontra: sabores artesanais com receita de família, num café que ficou de verdade para os moradores. É aqui que o passeio descansa e vira conversa.",
      tip: "No brunch de fim de semana costuma ter fila. Se for num sábado ou domingo, chegue antes das 9h30.",
      bestMoment: "Manhã ou tarde",
    },
  ];

  for (const stop of STOPS) {
    const placeId = placeIds[stop.name];
    if (!placeId) {
      console.warn(`  ⏭  Pulando parada "${stop.name}" — lugar não encontrado no banco`);
      continue;
    }

    const existingStop = await db.execute(
      sql`SELECT id FROM guided_tour_stops WHERE tourId = ${tourId} AND stopOrder = ${stop.order} LIMIT 1`
    );
    const existingStopRows = (existingStop as any)[0] as any[];

    if (existingStopRows.length > 0) {
      await db.execute(sql`
        UPDATE guided_tour_stops SET
          placeId     = ${placeId},
          narrative   = ${stop.narrative},
          tip         = ${stop.tip},
          bestMoment  = ${stop.bestMoment},
          updatedAt   = NOW()
        WHERE id = ${existingStopRows[0].id}
      `);
    } else {
      await db.execute(sql`
        INSERT INTO guided_tour_stops (tourId, placeId, stopOrder, narrative, tip, bestMoment)
        VALUES (${tourId}, ${placeId}, ${stop.order}, ${stop.narrative}, ${stop.tip}, ${stop.bestMoment})
      `);
    }
    console.log(`  🏷  Parada ${stop.order}: ${stop.name} ✓`);
  }

  console.log("\n🎉 Receptivo Oranje — seed concluído com sucesso");
  console.log(`\n📱 Acesse em: /app/receptivo/${SLUG}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
