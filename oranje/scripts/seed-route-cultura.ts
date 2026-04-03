/**
 * seed-route-cultura.ts
 *
 * Cria a rota editorial "Cultura em Holambra" com curadoria Oranje.
 *
 * Lógica curatorial:
 *   A identidade de Holambra não está só nas flores — está nos tijolos
 *   dos moinhos, nas receitas que os imigrantes holandeses trouxeram, nas
 *   festas que mantêm viva uma cultura de 75 anos. Este roteiro percorre
 *   esse fio condutor: de ícone em ícone, de história em história.
 *
 * Lugares (ordem do dia):
 *   1. Moinho Povos Unidos (2616)  — o símbolo, o ponto de partida
 *   2. De Immigrant Garden (36)    — almoço com história e temática
 *   3. Martin Holandesa (2613)     — culinária holandesa autêntica
 *   4. Expoflora Park (5)          — a história floral, o evento que define a cidade
 *   5. Parque Van Gogh (19)        — arte europeia no espaço público
 *
 * Run: npx tsx scripts/seed-route-cultura.ts
 */

import mysql2 from "mysql2/promise";

const ROUTE = {
  title: "Cultura em Holambra",
  description: `Holambra não é só uma cidade de flores. É uma cidade construída por imigrantes holandeses que chegaram nos anos 1950 com suas receitas, seus moinhos, suas festas e uma forma específica de olhar para a terra. Este roteiro percorre o fio condutor dessa identidade — do ícone mais fotografado da cidade até o parque que homenageia o pintor que mais amou campos floridos. Um dia inteiro para entender, de verdade, de onde vem o espírito de Holambra.`,
  theme: "Cultural",
  duration: "1 dia",
  isPublic: true,
  coverImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80&fit=crop",

  placeIds: [2616, 36, 2613, 5, 19],

  highlights: [
    "Moinho Povos Unidos: o ponto de partida obrigatório. Antes de qualquer restaurante ou parque, venha aqui entender visualmente por que Holambra é o que é. Foto, contexto e espírito da cidade — tudo num só lugar.",
    "De Immigrant Garden: o almoço que conta uma história. Culinária inspirada nos imigrantes que fundaram Holambra, em um ambiente que traduz com elegância o que significa ser holambrano.",
    "Martin Holandesa: o sabor mais autêntico da cidade. Uma confeitaria e restaurante que existe há anos no Boulevard Holandês e que resume, em cada prato, a herança culinária dos colonos holandeses.",
    "Expoflora Park: onde a cultura vira espetáculo. O parque que sedia a maior festa de flores do Brasil conta a história de Holambra através de jardins, exposições e a grandiosidade das flores que definiram a cidade.",
    "Parque Van Gogh: arte europeia no espaço público de uma cidade brasileira. Um presente à paisagem — e o encerramento perfeito para um roteiro sobre identidade e cultura.",
    "Dica Oranje: este roteiro funciona melhor de terça a domingo, começando pela manhã no Moinho (melhor luz até 10h) e encerrando no Van Gogh com o fim de tarde. Separe o dia inteiro — não é um roteiro para ser corrido.",
  ],

  placeNotes: {
    "2616": "O ponto de partida de qualquer conversa sobre Holambra. O Moinho Povos Unidos não é apenas um símbolo fotográfico — é o argumento central da identidade da cidade. Construído para celebrar as raízes holandesas dos fundadores, ele organiza o sentido de tudo que vem depois no roteiro. Chegue cedo, reserve tempo para caminhar ao redor e sentir a escala do lugar.",
    "36": "O almoço com mais alma do roteiro. O De Immigrant Garden traduz a história da imigração holandesa em culinária e ambiente — uma escolha intencional, não apenas gastronômica. Pratos inspirados nos colonos que fundaram Holambra, servidos em um jardim que parece ter crescido da mesma narrativa. É onde o roteiro cultural se torna uma experiência sensorial.",
    "2613": "A Martin Holandesa está no Boulevard Holandês há anos e isso não é acidente — é presença conquistada. Confeitaria fina, culinária holandesa com qualidade e um ambiente que sintetiza o imaginário dos imigrantes. Entre para um café, um doce ou um lanche da tarde — qualquer escolha aqui diz algo sobre quem construiu esta cidade.",
    "5": "A Expoflora não é apenas um festival — é o evento que colocou Holambra no mapa do Brasil. O parque que o sedia guarda parte dessa história ao longo do ano: jardins de exposição, estrutura permanente e aquele cenário que, nas temporadas de festival, recebe mais de 200 mil visitantes. Mesmo fora da Expoflora, vale a visita para entender a dimensão do que as flores representam para a cidade.",
    "19": "Um presente silencioso ao final do roteiro. O Parque Van Gogh — com o nome do pintor que eternizou os campos de girassol — fecha o dia com a linguagem da arte europeia integrada ao espaço público de uma cidade brasileira. Nenhuma escolha foi mais Holambra do que esta: um parque com esse nome, nessa cidade, diz tudo sobre a identidade que seus fundadores quiseram construir.",
  },
};

async function run() {
  console.log("🌷 Criando rota 'Cultura em Holambra'...\n");

  const conn = await mysql2.createConnection(process.env.DATABASE_URL!);

  // Check if route already exists
  const [existing]: any = await conn.execute(
    "SELECT id FROM routes WHERE title = ?",
    [ROUTE.title]
  );

  if (existing.length > 0) {
    console.log(`  ⚠️  Rota já existe (id=${existing[0].id}). Atualizando...`);
    await conn.execute(
      `UPDATE routes SET
        description = ?, theme = ?, duration = ?, isPublic = ?,
        coverImage = ?, placeIds = ?, highlights = ?, placeNotes = ?,
        updatedAt = NOW()
       WHERE id = ?`,
      [
        ROUTE.description, ROUTE.theme, ROUTE.duration, ROUTE.isPublic ? 1 : 0,
        ROUTE.coverImage,
        JSON.stringify(ROUTE.placeIds),
        JSON.stringify(ROUTE.highlights),
        JSON.stringify(ROUTE.placeNotes),
        existing[0].id,
      ]
    );
    console.log(`  ✅ Atualizada (id=${existing[0].id})`);
  } else {
    const [result]: any = await conn.execute(
      `INSERT INTO routes (title, description, theme, duration, isPublic, coverImage, placeIds, highlights, placeNotes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        ROUTE.title, ROUTE.description, ROUTE.theme, ROUTE.duration,
        ROUTE.isPublic ? 1 : 0, ROUTE.coverImage,
        JSON.stringify(ROUTE.placeIds),
        JSON.stringify(ROUTE.highlights),
        JSON.stringify(ROUTE.placeNotes),
      ]
    );
    console.log(`  ✅ Criada com id=${result.insertId}`);
  }

  console.log(`\n  Lugares: [${ROUTE.placeIds.join(", ")}]`);
  console.log(`  Highlights: ${ROUTE.highlights.length} entradas`);
  console.log(`  PlaceNotes: ${Object.keys(ROUTE.placeNotes).length} entradas`);

  await conn.end();
  console.log("\n✅ Concluído.");
}

run().catch(err => { console.error("❌ Falha:", err); process.exit(1); });
