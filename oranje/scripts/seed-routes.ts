/**
 * seed-routes.ts
 * Seeds / refreshes all curated Oranje routes in the DB.
 * Run with: npx tsx scripts/seed-routes.ts
 *
 * Real place IDs (confirmed from DB):
 *  Cafés:       27=Lotus Café, 29=Kéndi Confeitaria, 2=Café Moinho, 38=Amarena Doceria & Café
 *  Restaurantes: 24=Casa Bela, 25=Villa Girassol, 35=Garden Restaurante,
 *               36=De Immigrant Garden, 40=Italia no Box, 41=Food Garden, 42=Cowburguer
 *  Bares:       26=Holambier, 43=Quintal dos Avós, 44=Tulipa's Lounge
 *  Hotéis:      30=Royal Tulip, 31=Holambra Garden Hotel
 *  Parques:     32=Bloemen Park, 19=Parque Van Gogh, 34=Macena Flores
 *  Docerias:    28=Dolce Flor, 39=Kopenhagen
 *  Pizza:       37=De Pizza Bakker
 */

import { getDb } from "../server/db";
import { routes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const CURATED_ROUTES = [
  // ── 1. Holambra em 1 Dia ────────────────────────────────────────────────────
  {
    id: 1,
    title: "Holambra em 1 Dia",
    description:
      "Para quem tem apenas um dia e quer viver Holambra do jeito certo: café da manhã típico, almoço com vista, tarde entre flores e noite com sabor. Roteiro otimizado para aproveitar ao máximo.",
    theme: "Clássico",
    duration: "1 dia",
    placeIds: [27, 24, 32, 43],
    highlights: [
      "Comece o dia com um bom café no Lotus Café — o clima é acolhedor e o cardápio tem o melhor do universo europeu.",
      "Almoço no Casa Bela Restaurante, uma das experiências gastronômicas mais completas da cidade.",
      "Tarde no Bloemen Park: girassóis, flores e um pôr do sol que vale muito a foto.",
      "Encerre no Quintal dos Avós Gastrobar — boa cozinha, drinks e o melhor clima de fim de noite em Holambra.",
    ],
    placeNotes: {
      "27": "Começo ideal para o dia. Café especial, clima acolhedor e o cardápio com referência europeia — desde os croissants até as bebidas quentes.",
      "24": "Um dos restaurantes mais completos de Holambra. Ambiente cuidado, cozinha de qualidade e atendimento que faz diferença.",
      "32": "O símbolo vivo da cidade. Flores, girassóis e a melhor iluminação de fim de tarde — ideal para fotos e contemplação.",
      "43": "Entra aqui pelo clima. Gastrobar com ambiente descontraído, boa cozinha e drinks que fecham bem qualquer roteiro.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=800&h=500&fit=crop",
    isPublic: true,
  },

  // ── 2. Roteiro Romântico ────────────────────────────────────────────────────
  {
    id: 2,
    title: "Holambra Romântica",
    description:
      "Perfeito para casais que querem viver Holambra com mais charme, boa gastronomia e clima especial. Jardins floridos, hospedagem de qualidade e jantares inesquecíveis.",
    theme: "Romântico",
    duration: "1 dia",
    placeIds: [30, 27, 19, 25],
    highlights: [
      "Hospedagem no Royal Tulip — a melhor estrutura da cidade, com jardins e ambiente sofisticado.",
      "Café da manhã no Lotus Café: flores à vista, silêncio da manhã e o melhor café especial da região.",
      "Passeio no Parque Van Gogh ao fim da tarde, com luz dourada e paisagem que parece pintada.",
      "Jantar no Restaurante Villa Girassol — gastronomia refinada, ambiente íntimo e a sensação de que o dia valeu cada minuto.",
    ],
    placeNotes: {
      "30": "A hospedagem certa para o roteiro. Jardins cuidados, boa infraestrutura e um ambiente que já coloca o casal no clima.",
      "27": "Ideal para começar o dia com tranquilidade. Café especial, espaço bonito e o ritmo certo para uma manhã a dois.",
      "19": "O parque mais fotogênico de Holambra. Ótimo para uma caminhada leve no fim da tarde, com luz natural e paz.",
      "25": "Escolhido pela experiência gastronômica e pelo ambiente. Um jantar que encerra bem qualquer roteiro especial.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
    isPublic: true,
  },

  // ── 3. Dia Chuvoso ──────────────────────────────────────────────────────────
  {
    id: 3,
    title: "Dia Chuvoso em Holambra",
    description:
      "Chuva não é desculpa para ficar no hotel. Este roteiro foi feito para dias de tempo fechado: cafés acolhedores, gastronomia reconfortante e experiências 100% indoor que valem a parada.",
    theme: "Indoor",
    duration: "Meio dia",
    placeIds: [29, 36, 38],
    highlights: [
      "Comece na Kéndi Confeitaria — a chuva lá fora, o café quente na mão e as stroopwafels na mesa.",
      "Almoço no De Immigrant Garden: gastronomia envolvente, ambiente coberto e muita personalidade.",
      "Finalize na Amarena Doceria & Café — sobremesas finas, boas bebidas e o conforto que fecha bem um dia chuvoso.",
    ],
    placeNotes: {
      "29": "Feita para este tipo de dia. Ambiente aconchegante, doces holandeses e o melhor café quente da cidade.",
      "36": "Entra no roteiro pela proposta gastronômica diferenciada e pelo espaço coberto e bem estruturado.",
      "38": "O encerramento perfeito. Sobremesas sofisticadas, ambiente cuidado e a doçura que o dia pede.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop",
    isPublic: true,
  },

  // ── 4. Holambra Clássica ────────────────────────────────────────────────────
  {
    title: "Holambra Clássica",
    description:
      "Para quem visita Holambra pela primeira vez e quer sentir a essência real da cidade: os pontos mais icônicos, a gastronomia mais representativa e o charme que ninguém esquece.",
    theme: "Clássico",
    duration: "1 dia",
    placeIds: [2, 19, 32, 24, 44],
    highlights: [
      "Café da manhã no Café Moinho — um dos mais tradicionais de Holambra, com aquele charme europeu de sempre.",
      "Parque Van Gogh: o cartão-postal da cidade. Flores, fotografia e a essência visual do que é Holambra.",
      "Bloemen Park ao fim da tarde: o lugar mais bonito da cidade para ver o sol indo embora entre os girassóis.",
      "Jantar no Tulipa's Lounge — um encerramento com ambiente diferenciado, drinks e boa cozinha.",
    ],
    placeNotes: {
      "2": "Um dos cafés mais tradicionais da cidade. Entra aqui para começar o dia no clima certo — europeu, charmoso e genuíno.",
      "19": "Impossível conhecer Holambra sem passar pelo Van Gogh. O parque mais fotografado da cidade.",
      "32": "A plantação de girassóis voltada para o pôr do sol é um espetáculo. Um dos melhores momentos que Holambra oferece.",
      "24": "Almoço no lugar certo: gastronomia de qualidade, ambiente familiar e uma das experiências mais completas da cidade.",
      "44": "Encerramento com estilo. Ambiente descontraído, drinks bem feitos e aquele clima que convida a ficar mais um pouco.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop",
    isPublic: true,
  },

  // ── 5. Roteiro Gastronômico ─────────────────────────────────────────────────
  {
    title: "Sabores de Holambra",
    description:
      "Para quem vai a Holambra para comer bem. Uma jornada gastronômica que começa com café especial, passa por almoço de qualidade, pausa com doces finos e fecha com jantar e bar.",
    theme: "Gastronômico",
    duration: "1 dia",
    placeIds: [27, 25, 39, 43],
    highlights: [
      "Lotus Café: o ponto de partida perfeito para quem leva café a sério.",
      "Villa Girassol no almoço: refinamento, bom paladar e um dos melhores menus da cidade.",
      "Kopenhagen para a pausa da tarde — chocolates e doces que valem o desvio.",
      "Quintal dos Avós para fechar: gastrobar com drinks, petiscos e o clima certo para a noite.",
    ],
    placeNotes: {
      "27": "Café especial de verdade. Entra aqui pelo cardápio, pelo ambiente e pelo padrão que todo foodlover espera.",
      "25": "O restaurante mais refinado do roteiro. Gastronomia consistente, apresentação caprichada e boa seleção de pratos.",
      "39": "A pausa de meio de tarde com doces sofisticados. Kopenhagen em Holambra tem personalidade própria.",
      "43": "Gastrobar que fecha o roteiro com chave de ouro: drinks bem elaborados, petiscos e o ambiente mais descontraído da lista.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop",
    isPublic: true,
  },

  // ── 6. Família em Holambra ──────────────────────────────────────────────────
  {
    title: "Família em Holambra",
    description:
      "Roteiro com ritmo leve, espaços abertos e opções que funcionam para todas as idades. Parques, boa alimentação e experiências que crianças e adultos curtem juntos.",
    theme: "Família",
    duration: "1 dia",
    placeIds: [29, 32, 19, 41],
    highlights: [
      "Kéndi Confeitaria para começar o dia: doces, café e aquele charme que agrada adultos e crianças.",
      "Bloemen Park: flores, espaço aberto e o melhor ambiente ao ar livre de Holambra para toda a família.",
      "Parque Van Gogh para a tarde: trilhas leves, fotografias e a natureza ao redor.",
      "Food Garden Holambra para o almoço ou lanche: espaço amplo, diversidade de opções e ritmo tranquilo.",
    ],
    placeNotes: {
      "29": "Ótimo para começar o passeio. Confeitaria com doces artesanais, espaço convidativo e que agrada qualquer idade.",
      "32": "O parque mais amplo e florido de Holambra. Espaço ao ar livre, seguro e com muito o que ver e registrar.",
      "19": "Parque com paisagem diferenciada, ótimo para caminhadas curtas e fotos com as crianças.",
      "41": "Almoço ou lanche descomplicado, com espaço para todos e variedade que atende desde os menores até os mais exigentes.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop",
    isPublic: true,
  },

  // ── 7. Pôr do Sol & Fotos ────────────────────────────────────────────────────
  {
    title: "Pôr do Sol & Fotos",
    description:
      "Para quem vai a Holambra atrás de cenários bonitos, fotografia e aquela luz de fim de tarde que não tem igual. Um roteiro visual, leve e inesquecível.",
    theme: "Fotografia",
    duration: "Tarde",
    placeIds: [34, 32, 19, 44],
    highlights: [
      "Macena Flores: um mar de cores e flores que fotografa bem em qualquer horário.",
      "Bloemen Park: o girassol dourado no final da tarde é um dos melhores cenários naturais da região.",
      "Parque Van Gogh para as fotos clássicas de Holambra — flores, paisagem e aquela luz suave.",
      "Encerramento no Tulipa's Lounge: drinks, ambiente diferenciado e o clima ideal para fechar o dia.",
    ],
    placeNotes: {
      "34": "Flores em abundância e cores vivas que funcionam perfeitamente para fotografia. Visita que vale qualquer horário.",
      "32": "O pôr do sol entre os girassóis do Bloemen Park é o cartão-postal mais buscado de Holambra. Chegue antes das 17h.",
      "19": "Parque com cenários clássicos da cidade — ótimo para uma sequência fotográfica com a natureza como pano de fundo.",
      "44": "Lounge com iluminação cuidada e ambiente que fecha bem o roteiro. Drinks, conversa e o fim de tarde com estilo.",
    },
    coverImage:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEieEuycyLNX6oOGxA8hhRFYhMOvmnUZhUBIw-0ynGXz0_ZubfLYRbA3mJok6LEugb-2gXvJc2DA96WivPzH6ldaMJnpA01IFc1bt7n8lM05Xdo_B5ovmQfNSJYPe3VhNu5oAKKnkOTT4mL8fKMiAiZCn_EAR2DCJAQU-dulwTld1kkqlkyDRCs0oN2JPnWg/s1624/Screenshot%202025-02-18%20at%2011.14.58.png",
    isPublic: true,
  },

  // ── 8. Fim de Semana Completo ────────────────────────────────────────────────
  {
    title: "Fim de Semana em Holambra",
    description:
      "Para quem tem dois dias e quer viver tudo que Holambra tem a oferecer: hospedagem boa, gastronomia completa, parques, flores e a experiência de desacelerar numa cidade que sabe receber.",
    theme: "Relaxante",
    duration: "2 dias",
    placeIds: [30, 27, 32, 25, 43],
    highlights: [
      "Royal Tulip para dormir: a melhor estrutura de hospedagem da cidade, com jardins e conforto real.",
      "Lotus Café para as manhãs: o começo de dia mais agradável que Holambra oferece.",
      "Bloemen Park para as tardes: flores, ar livre e aquele ritmo de quem está em férias de verdade.",
      "Villa Girassol para o jantar de sábado: a experiência gastronômica que merece o momento especial.",
      "Quintal dos Avós para a última noite: drinks, clima descontraído e um encerramento à altura.",
    ],
    placeNotes: {
      "30": "A base do fim de semana. Infraestrutura completa, jardins belíssimos e o nível de conforto que o descanso merece.",
      "27": "A escolha certa para as manhãs do fim de semana. Café especial, ambiente agradável e o ritmo lento que bom.",
      "32": "Dois dias em Holambra pedem pelo menos uma visita ao Bloemen Park. Flores, espaço e luz natural incomparáveis.",
      "25": "O jantar de destaque do fim de semana. Gastronomia de qualidade, apresentação cuidada e ambiente para momentos especiais.",
      "43": "O encerramento ideal. Gastrobar com drinks bem feitos e atmosfera descontraída — o jeito certo de fechar o fim de semana.",
    },
    coverImage:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=500&fit=crop",
    isPublic: true,
  },
];

async function seedRoutes() {
  console.log("🌷 Iniciando seed dos roteiros curados do Oranje...\n");

  const drizzle = await getDb();
  if (!drizzle) throw new Error("Falha ao conectar ao banco de dados");

  for (const route of CURATED_ROUTES) {
    const { id, ...data } = route as any;

    if (id) {
      // Update existing route
      await drizzle
        .update(routes)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(routes.id, id));
      console.log(`  ✅ Atualizado: [${id}] ${data.title}`);
    } else {
      // Insert new route
      await drizzle.insert(routes).values({
        ...data,
        userId: null,
      } as any);
      console.log(`  ✨ Criado: ${data.title}`);
    }
  }

  console.log("\n🎉 Seed de roteiros concluído!");
  process.exit(0);
}

seedRoutes().catch((err) => {
  console.error("❌ Erro ao seedar roteiros:", err);
  process.exit(1);
});
