/**
 * patch-datapending-places.ts
 *
 * Atualiza os 20 lugares com dataPending=1 com dados verificados via
 * pesquisa pública (TripAdvisor, sites oficiais, Instagram, Prefeitura de Holambra).
 *
 * Critério de dataPending=0 nesta rodada:
 *   - Endereço exato + horário completo confirmados + ao menos instagram/telefone
 *
 * Lugares que passam para dataPending=0: 6 de 20
 *   [19] Parque Van Gogh, [28] Dolce Flor, [34] Macena Flores,
 *   [35] Garden Restaurante, [40] Italia no Box, [42] Cowburguer
 *
 * Lugares que ficam dataPending=1 (dados parciais adicionados): 12 de 20
 * Lugares sem dados novos encontrados: 2 (Café Moinho, Kopenhagen)
 *
 * Run: npx tsx scripts/patch-datapending-places.ts
 */

import mysql2 from "mysql2/promise";

// openingHours format: {"seg":[[open,close],[...]]|null,"ter":...,"qua":...,"qui":...,"sex":...,"sab":...,"dom":...}

const PATCHES: Array<{
  id: number;
  name: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  mapsUrl?: string;
  openingHours?: string;
  dataPending?: 0 | 1;
  isFree?: boolean;
  shortDesc?: string;
  tags?: string;
  note?: string; // internal note, not saved to DB
}> = [

  // ─── PARQUES ─────────────────────────────────────────────────────

  {
    id: 19,
    name: "Parque Van Gogh",
    address: "Av. das Tulipas, 461 – Holambra, SP, 13825-000",
    mapsUrl: "https://maps.google.com/?q=Av.+das+Tulipas,+461,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: [["09:00","18:00"]],
      ter: null,
      qua: null,
      qui: null,
      sex: [["09:00","18:00"]],
      sab: [["09:00","18:00"]],
      dom: [["09:00","18:00"]],
    }),
    isFree: true,
    dataPending: 0,
    shortDesc: "Parque às margens do Lago do Holandês com escorregadores, tirolesa e pedalinhos — a parada perfeita para crianças e famílias.",
    tags: "parque,familia,fotos,passeio,gratuito,criancas,perto_do_lago,roteiro_cultura",
    note: "Fonte: Prefeitura de Holambra + saopauloparacriancas.com.br. Sex-Seg + feriados 9h-18h.",
  },

  {
    id: 21,
    name: "Cidade das Crianças",
    address: "Rod. SP-107, próximo ao Moinho Povos Unidos – Holambra, SP",
    mapsUrl: "https://maps.google.com/?q=Cidade+das+Criancas+Holambra+SP",
    openingHours: JSON.stringify({
      seg: null,
      ter: [["09:00","17:00"]],
      qua: [["09:00","17:00"]],
      qui: [["09:00","17:00"]],
      sex: [["09:00","17:00"]],
      sab: [["09:00","17:00"]],
      dom: [["09:00","17:00"]],
    }),
    dataPending: 1, // sem telefone/coordenadas exatas confirmadas
    shortDesc: "Parque público infantil perto do Moinho Povos Unidos — brinquedos ao ar livre para crianças pequenas.",
    tags: "familia,kids,parque,dia,gratuito,criancas",
    note: "Fonte: familiaitinerante.com.br. Ter-Dom 9h-17h. Sem telefone encontrado.",
  },

  {
    id: 23,
    name: "Nossa Prainha",
    address: "R. José Martins, 155 – Morada das Flores, Holambra, SP, 13825-000",
    mapsUrl: "https://maps.google.com/?q=R.+Jos%C3%A9+Martins,+155,+Holambra,+SP",
    dataPending: 1, // sem horário formal e sem telefone
    shortDesc: "Orla com areia e área de lazer à beira do lago — boa pausa ao ar livre próxima ao Deck do Amor.",
    tags: "familia,parque,gratuito,dia,lago,ao_ar_livre",
    note: "Fonte: trip.com e buser.com.br. Sem horário formal — acesso livre.",
  },

  {
    id: 34,
    name: "Macena Flores",
    address: "Sítio Lote E-9 – Bairro Alegre, Holambra, SP, 13825-000",
    phone: "(19) 3802-2230",
    whatsapp: "(19) 99889-5303",
    instagram: "macena_flores",
    website: "https://www.macenaflores.com.br",
    mapsUrl: "https://maps.google.com/?q=Macena+Flores+Holambra+SP",
    openingHours: JSON.stringify({
      seg: [["09:00","17:00"]],
      ter: [["09:00","17:00"]],
      qua: [["09:00","17:00"]],
      qui: [["09:00","17:00"]],
      sex: [["09:00","17:00"]],
      sab: [["09:00","17:00"]],
      dom: [["09:00","17:00"]],
    }),
    dataPending: 0,
    shortDesc: "Produtor de flores em sítio aberto ao público — atacado e varejo, direto do campo, todos os dias da semana.",
    tags: "flores,turismo_rural,natureza,compras,familia,roteiro_cultura,perto_da_natureza",
    note: "Fonte: visiteholambra.com.br + @macena_flores. Seg-Dom 9h-17h.",
  },

  // ─── CAFÉS & CONFEITARIAS ─────────────────────────────────────────

  {
    id: 2,
    name: "Café Moinho",
    // Nenhum dado novo confiável encontrado — Facebook existe mas sem horário indexado
    // @confeitariamoinhoholandes confirmado como Curitiba/PR — não usar
    dataPending: 1,
    note: "PENDENTE: Facebook @cafemoinhoholandes existe mas não expõe horário/telefone. Verificação manual necessária no local.",
  },

  {
    id: 27,
    name: "Lotus Café",
    address: "R. Primavera, 936 – Centro, Holambra, SP, 13825-000",
    whatsapp: "(19) 99316-0734",
    instagram: "olotuscafe",
    mapsUrl: "https://maps.google.com/?q=R.+Primavera,+936,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: [["08:00","12:00"],["15:00","19:00"]],
      ter: null,
      qua: [["08:00","12:00"],["15:00","19:00"]],
      qui: [["08:00","12:00"],["15:00","19:00"]],
      sex: [["08:00","12:00"],["15:00","19:00"]],
      sab: null, // horário sáb/dom não confirmado publicamente
      dom: null,
    }),
    dataPending: 1, // Sáb/Dom não confirmados
    shortDesc: "Café aconchegante com cardápio variado — ponto de pausa curado pelo Oranje para o meio da manhã ou da tarde.",
    tags: "cafe,cafe_da_manha,casal,fotos,curadoria_oranje,roteiro_1_dia",
    note: "Fonte: lotuscafehol.goomer.app. Seg/Qua-Sex 8h-12h e 15h-19h. Sáb/Dom não confirmados. Ter fechado.",
  },

  {
    id: 28,
    name: "Dolce Flor Holambra",
    address: "R. Solidagos, 125 – Morada das Flores, Holambra, SP, 13825-000",
    phone: "(19) 99907-1609",
    instagram: "dolceflorholambra",
    mapsUrl: "https://maps.google.com/?q=R.+Solidagos,+125,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: [["13:00","18:30"]],
      ter: [["13:00","18:30"]],
      qua: [["13:00","18:30"]],
      qui: [["13:00","19:00"]],
      sex: [["13:00","19:00"]],
      sab: [["11:00","19:00"]],
      dom: [["11:00","19:00"]],
    }),
    dataPending: 0,
    shortDesc: "Doceria com apelo visual forte e cardápio de sorvetes e doces artesanais — pausa doce clássica de Holambra.",
    tags: "doces,sorvetes,fotos,casal,familia,curadoria_oranje,tarde",
    note: "Fonte: @dolceflorholambra + cardapio.menu. Seg-Qua 13h-18h30, Qui-Sex 13h-19h, Sáb-Dom 11h-19h.",
  },

  {
    id: 29,
    name: "Kéndi Confeitaria",
    address: "R. Rota dos Imigrantes, 409 – Holambra, SP, 13825-067",
    phone: "(19) 3802-4568",
    instagram: "kendicafeteria",
    website: "https://www.kendidoces.com.br",
    mapsUrl: "https://maps.google.com/?q=R.+Rota+dos+Imigrantes,+409,+Holambra,+SP",
    dataPending: 1, // horário não confirmado publicamente
    shortDesc: "Confeitaria e cafeteria com doces finos e café — opção aconchegante para qualquer hora do dia no centro de Holambra.",
    tags: "cafe,doces,cafe_da_manha,familia,casal,dia_chuvoso,centro",
    note: "Fonte: @kendicafeteria + restaurantguru. Horário não confirmado — verificação manual necessária.",
  },

  // ─── RESTAURANTES ────────────────────────────────────────────────

  {
    id: 25,
    name: "Restaurante Villa Girassol",
    address: "R. Dória Vasconcelos, 220 – Centro, Holambra, SP, 13825-000",
    phone: "(19) 3867-3303",
    instagram: "villa_girassol",
    mapsUrl: "https://maps.google.com/?q=R.+D%C3%B3ria+Vasconcelos,+220,+Holambra,+SP",
    dataPending: 1, // horário não confirmado publicamente
    shortDesc: "Gastronomia regional com vista privilegiada para os campos de flores — almoço dominical clássico de Holambra.",
    tags: "regional,almoço,natureza,flores,casal,familia,dominical,vista",
    note: "Fonte: TripAdvisor + @villa_girassol. Horário não confirmado — verificar direto.",
  },

  {
    id: 35,
    name: "Garden Restaurante",
    address: "R. Dória Vasconcelos, 229 – Holambra, SP",
    phone: "(19) 3802-1984",
    instagram: "restaurantegardenholambra",
    mapsUrl: "https://maps.google.com/?q=R.+D%C3%B3ria+Vasconcelos,+229,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: [["11:30","15:30"],["18:30","22:00"]],
      ter: null,
      qua: null,
      qui: [["11:30","15:30"],["18:30","22:00"]],
      sex: [["11:30","15:30"],["18:30","22:00"]],
      sab: [["11:30","15:30"],["18:30","22:00"]],
      dom: [["11:30","15:30"]],
    }),
    dataPending: 0,
    shortDesc: "Restaurante com culinária tipicamente holandesa, almoço e jantar — experiência gastronômica no coração de Holambra.",
    tags: "regional,almoço,jantar,casal,familia,roteiro_romantico,gastronomia_holandesa,curadoria_oranje",
    note: "Fonte: @restaurantegardenholambra + cardapio.menu. Qui-Sáb 11h30-15h30/18h30-22h, Dom somente almoço, Ter-Qua fechado.",
  },

  {
    id: 36,
    name: "De Immigrant Garden",
    address: "R. Dória Vasconcelos, 293 – Holambra, SP",
    instagram: "deimmigrant",
    mapsUrl: "https://maps.google.com/?q=R.+D%C3%B3ria+Vasconcelos,+293,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: [["08:00","22:00"]],
      ter: [["08:00","22:00"]],
      qua: [["08:00","22:00"]],
      qui: [["08:00","22:00"]],
      sex: [["08:00","22:00"]],
      sab: [["08:00","22:00"]],
      dom: [["08:00","22:00"]],
    }),
    dataPending: 1, // horário de fechamento não confirmado publicamente — 22h estimado
    shortDesc: "Gastro café aberto todos os dias desde as 8h — culinária da imigração holandesa em ambiente que conta a história de Holambra.",
    tags: "cafe,regional,almoço,jantar,cafe_da_manha,casal,roteiro_cultura,gastronomia_holandesa,curadoria_oranje",
    note: "Fonte: @deimmigrant. Abre 8h todos os dias. Fechamento não confirmado — 22h é estimativa cautelosa.",
  },

  {
    id: 37,
    name: "De Pizza Bakker",
    address: "R. Campo do Pouso, 1239, Box 2 – Centro, Holambra, SP, 13825-000",
    phone: "(19) 99796-2685",
    instagram: "de.pizza.bakker",
    mapsUrl: "https://maps.google.com/?q=R.+Campo+do+Pouso,+1239,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: null,
      ter: null,
      qua: [["18:00","23:00"]],
      qui: [["18:00","23:00"]],
      sex: [["18:00","23:00"]],
      sab: [["18:00","23:00"]],
      dom: [["18:00","23:00"]],
    }),
    dataPending: 1, // horário de fechamento não confirmado — 23h estimado
    shortDesc: "Pizzaria napolitana em container no centro de Holambra — massa fina, ingredientes artesanais, funcionamento noturno.",
    tags: "pizza,jantar,noite,casal,artesanal,napolitana",
    note: "Fonte: @de.pizza.bakker + de-pizza-bakker.goomer.app. Qua-Dom 18h+. Fechamento estimado 23h.",
  },

  {
    id: 38,
    name: "Amarena Doceria & Café",
    instagram: "amarena_holambra", // corrigido — @amarenadoceriaecafe é Jaguariúna/SP
    dataPending: 1,
    shortDesc: "Doceria artesanal com doces finos e cafés especiais — endereço e horário aguardam confirmação.",
    tags: "doces,cafe,artesanal,familia,casal",
    note: "CORRIGIDO: @amarenadoceriaecafe é Jaguariúna/SP. @amarena_holambra é a unidade de Holambra. Endereço/horário não encontrados.",
  },

  {
    id: 39,
    name: "Kopenhagen Holambra",
    dataPending: 1,
    note: "PENDENTE: Não foi possível confirmar unidade ativa da Kopenhagen em Holambra. Verificação manual necessária.",
  },

  {
    id: 40,
    name: "Italia no Box",
    address: "R. Campo do Pouso, 1189, Boxes 03 e 04 – Holambra, SP, 13825-063",
    instagram: "italianobox.holambra",
    mapsUrl: "https://maps.google.com/?q=R.+Campo+do+Pouso,+1189,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: [["11:00","14:30"],["18:00","21:00"]],
      ter: null,
      qua: [["11:00","14:30"],["18:00","21:00"]],
      qui: [["11:00","14:30"],["18:00","21:00"]],
      sex: [["11:00","14:30"],["18:00","21:00"]],
      sab: [["11:00","14:30"],["18:00","21:00"]],
      dom: [["11:00","14:30"],["18:00","21:00"]],
    }),
    dataPending: 0,
    shortDesc: "Culinária italiana autêntica dentro do Food Garden — almoço e jantar, fechado às terças.",
    tags: "italiana,almoço,jantar,familia,casal,food_park",
    note: "Fonte: gazetadepinheiros.com.br + @italianobox.holambra. Seg/Qua-Dom 11h-14h30 e 18h-21h. Ter fechado.",
  },

  {
    id: 41,
    name: "Food Garden Holambra",
    instagram: "garden.foodpark",
    dataPending: 1, // endereço exato e horário não confirmados publicamente
    shortDesc: "O primeiro food park do Brasil — espaço gastronômico ao ar livre com múltiplas cozinhas no centro de Holambra.",
    tags: "food_park,variado,ao_ar_livre,grupos,familia,jantar,fim_de_semana",
    note: "Fonte: @garden.foodpark + Facebook foodgardenbrasil. Endereço exato e horário não indexados.",
  },

  {
    id: 42,
    name: "Cowburguer",
    address: "R. Nair Ferreira Coelho Brachi, 695 – Bairro Novo Cambuí, Holambra, SP",
    instagram: "cowburguer_holambra",
    mapsUrl: "https://maps.google.com/?q=R.+Nair+Ferreira+Coelho+Brachi,+695,+Holambra,+SP",
    openingHours: JSON.stringify({
      seg: null,
      ter: null,
      qua: [["19:00","23:00"]],
      qui: [["19:00","23:00"]],
      sex: [["19:00","23:00"]],
      sab: [["19:00","23:00"]],
      dom: [["19:00","23:00"]],
    }),
    dataPending: 0,
    shortDesc: "Hamburgueria artesanal com blend especial de carne — funcionamento noturno, Qua a Dom.",
    tags: "hambúrguer,artesanal,jantar,noite,lanche,rapido,casal",
    note: "Fonte: @cowburguer_holambra. Qua-Dom 19h-23h. Seg-Ter fechado.",
  },

  // ─── GASTROBARES ─────────────────────────────────────────────────

  {
    id: 12,
    name: "Deck 237",
    address: "R. Solidagos, 237 – Jardim Morada das Flores, Holambra, SP, 13825-000",
    phone: "(19) 3802-5321",
    instagram: "deck_237",
    website: "https://deck237.wixsite.com/deck237-1",
    mapsUrl: "https://maps.google.com/?q=R.+Solidagos,+237,+Holambra,+SP",
    dataPending: 1, // horário não publicado / confirmado
    note: "Fonte: deck237.wixsite.com + @deck_237. Prefeitura não divulga horário. Verificar direto.",
  },

  {
    id: 43,
    name: "Quintal dos Avós Gastrobar",
    address: "R. Campo do Pouso, 1163 – Holambra, SP, 13825-000",
    instagram: "quintaldosavosgastrobar",
    mapsUrl: "https://maps.google.com/?q=R.+Campo+do+Pouso,+1163,+Holambra,+SP",
    dataPending: 1, // horário não confirmado
    shortDesc: "Gastrobar com hot dog artesanal, burgers e crepes — primeiro hot dog da cidade, música ao vivo nos fins de semana.",
    tags: "bar,gastrobar,casal,noite,curadoria_oranje,musica_ao_vivo,fim_de_semana",
    note: "Fonte: @quintaldosavosgastrobar + Facebook. Horário não confirmado — verificar no Instagram.",
  },

  {
    id: 44,
    name: "Tulipa's Lounge",
    address: "R. Campo do Pouso, 1162 – Centro, Holambra, SP, 13825-063",
    instagram: "tulipaslounge",
    mapsUrl: "https://maps.google.com/?q=R.+Campo+do+Pouso,+1162,+Holambra,+SP",
    dataPending: 1, // horário não confirmado
    shortDesc: "Lounge sofisticado no mesmo corredor do Food Garden — para estender a noite de Holambra com mais refinamento.",
    tags: "bar,lounge,casal,premium,noite,fim_de_semana",
    note: "Fonte: @tulipaslounge + Facebook. Horário não confirmado.",
  },
];

async function run() {
  console.log("🔧 Atualizando 20 lugares com dataPending=1...\n");
  const conn = await mysql2.createConnection(process.env.DATABASE_URL!);

  let updated = 0;
  let cleared = 0;
  let partial = 0;
  let noChange = 0;

  for (const p of PATCHES) {
    const fields: string[] = [];
    const values: any[] = [];

    if (p.address !== undefined) { fields.push("address = ?"); values.push(p.address); }
    if (p.phone !== undefined) { fields.push("phone = ?"); values.push(p.phone); }
    if (p.whatsapp !== undefined) { fields.push("whatsapp = ?"); values.push(p.whatsapp); }
    if (p.instagram !== undefined) { fields.push("instagram = ?"); values.push(p.instagram); }
    if (p.website !== undefined) { fields.push("website = ?"); values.push(p.website); }
    if (p.mapsUrl !== undefined) { fields.push("mapsUrl = ?"); values.push(p.mapsUrl); }
    if (p.openingHours !== undefined) { fields.push("openingHours = ?"); values.push(p.openingHours); }
    if (p.dataPending !== undefined) { fields.push("dataPending = ?"); values.push(p.dataPending); }
    if (p.isFree !== undefined) { fields.push("isFree = ?"); values.push(p.isFree ? 1 : 0); }
    if (p.shortDesc !== undefined) { fields.push("shortDesc = ?"); values.push(p.shortDesc); }
    if (p.tags !== undefined) { fields.push("tags = ?"); values.push(p.tags); }

    if (fields.length === 0) {
      console.log(`  ⚪ [${p.id}] ${p.name.padEnd(35)} → sem dados novos (dataPending=1 mantido)`);
      console.log(`     ⚠ ${p.note}`);
      noChange++;
      continue;
    }

    values.push(p.id);
    await conn.execute(
      `UPDATE places SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const status = p.dataPending === 0 ? "✅ COMPLETO" : "🔄 PARCIAL";
    const symbol = p.dataPending === 0 ? "✅" : "🔄";
    const fieldsStr = fields.map(f => f.split(" =")[0]).join(", ");
    console.log(`  ${symbol} [${p.id}] ${p.name.padEnd(35)} → ${fieldsStr}`);
    if (p.note) console.log(`     📝 ${p.note}`);

    if (p.dataPending === 0) cleared++;
    else partial++;
    updated++;
  }

  console.log(`\n📊 Resumo:`);
  console.log(`  ✅ Completos (dataPending→0): ${cleared}`);
  console.log(`  🔄 Parciais (dados adicionados, dataPending=1): ${partial}`);
  console.log(`  ⚪ Sem dados novos: ${noChange}`);
  console.log(`  Total atualizado: ${updated}/${PATCHES.length}`);

  await conn.end();
  console.log("\n✅ Patch concluído.");
}

run().catch(err => { console.error("❌", err); process.exit(1); });
