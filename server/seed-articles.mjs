import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.DATABASE_URL);

const articles = [
  {
    title: "Holambra: A Capital das Flores do Brasil",
    slug: "holambra-capital-flores-brasil",
    excerpt: "Conheça a história e importância de Holambra como maior produtora de flores do Brasil.",
    content: `# Holambra: A Capital das Flores do Brasil

Holambra é uma cidade localizada no interior de São Paulo que se destaca como a maior produtora de flores do Brasil. Com uma história rica e uma comunidade dedicada ao cultivo de flores, a cidade se tornou um destino imprescindível para quem quer conhecer a beleza e a riqueza da floricultura brasileira.

## A História de Holambra

Fundada em 1948 por imigrantes holandeses, Holambra nasceu do sonho de criar uma comunidade agrícola próspera. O nome da cidade é uma junção de "Holanda" e "Brasil", refletindo suas raízes e seu compromisso com o país.

## Por Que Holambra é Especial

A cidade é responsável por mais de 70% da produção de flores do Brasil. Seus produtores são reconhecidos internacionalmente pela qualidade e variedade de flores cultivadas. A Expoflora, a maior exposição de flores do Brasil, acontece anualmente em Holambra e atrai centenas de milhares de visitantes.

## Visitando Holambra

Se você é amante de flores, natureza ou simplesmente quer vivenciar uma experiência única, Holambra oferece muito mais que apenas flores. A cidade possui restaurantes de qualidade, hospedagem confortável e uma comunidade acolhedora que recebe visitantes de todo o mundo.`,
    seoTitle: "Holambra: A Capital das Flores do Brasil | Guia Completo",
    seoDescription: "Descubra Holambra, a maior produtora de flores do Brasil. História, atrações e dicas para sua visita.",
    seoKeywords: "Holambra, flores, turismo, São Paulo",
    category: "história",
    coverImageUrl: "https://images.unsplash.com/photo-1490377795597-a2b73b8b98b1?w=800&q=80",
  },
  {
    title: "Expoflora: O Maior Evento de Flores do Brasil",
    slug: "expoflora-maior-evento-flores",
    excerpt: "Tudo sobre a Expoflora, a maior exposição de flores do Brasil que acontece em Holambra.",
    content: `# Expoflora: O Maior Evento de Flores do Brasil

A Expoflora é o maior evento de flores do Brasil e um dos maiores do mundo. Acontece anualmente em Holambra e atrai mais de 600 mil visitantes de todo o país e do exterior.

## O Que Esperar da Expoflora

Durante a Expoflora, Holambra se transforma em um espetáculo de cores, aromas e beleza. O evento apresenta exposições de flores, plantas ornamentais, artesanato, gastronomia e entretenimento.

## Quando Visitar

A Expoflora acontece geralmente entre agosto e setembro. As datas variam a cada ano, então é importante verificar o calendário oficial para planejar sua visita.

## Dicas para Aproveitar ao Máximo

- Chegue cedo para evitar multidões
- Use sapatos confortáveis
- Leve protetor solar e chapéu
- Reserve tempo para explorar todas as áreas
- Experimente a gastronomia local`,
    seoTitle: "Expoflora: O Maior Festival de Flores do Brasil",
    seoDescription: "Guia completo sobre a Expoflora em Holambra. Datas, atrações e dicas para sua visita.",
    seoKeywords: "Expoflora, flores, evento, Holambra",
    category: "eventos",
    coverImageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
  },
  {
    title: "Gastronomia em Holambra: Sabores Únicos",
    slug: "gastronomia-holambra-sabores",
    excerpt: "Explore a culinária de Holambra, que combina tradições holandesas com ingredientes locais.",
    content: `# Gastronomia em Holambra: Sabores Únicos

Holambra oferece uma experiência gastronômica única que combina tradições holandesas com ingredientes frescos da região. A culinária local é um reflexo da história e da cultura da cidade.

## Influências Holandesas

Muitos restaurantes em Holambra oferecem pratos tradicionais holandeses adaptados com ingredientes locais. Você encontrará desde queijos artesanais até pratos típicos da culinária europeia.

## Ingredientes Locais

A proximidade com produtores locais garante que muitos restaurantes utilizam ingredientes frescos e de qualidade. Flores comestíveis, frutas e vegetais cultivados na região são frequentemente incorporados aos pratos.

## Restaurantes Recomendados

Holambra possui diversos restaurantes que variam desde estabelecimentos casuais até opções mais sofisticadas. A maioria oferece ambiente acolhedor e atendimento de qualidade.

## Experiências Gastronômicas

Além dos restaurantes tradicionais, Holambra oferece tours gastronômicos, degustações e eventos culinários que permitem conhecer melhor a culinária local.`,
    seoTitle: "Gastronomia em Holambra: Pratos Típicos e Restaurantes",
    seoDescription: "Descubra a culinária única de Holambra. Tradições holandesas e ingredientes locais.",
    seoKeywords: "gastronomia, restaurantes, Holambra, culinária",
    category: "gastronomia",
    coverImageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
  },
  {
    title: "Roteiros Turísticos em Holambra",
    slug: "roteiros-turisticos-holambra",
    excerpt: "Conheça os melhores roteiros para explorar Holambra e seus arredores.",
    content: `# Roteiros Turísticos em Holambra

Holambra oferece diversos roteiros turísticos que permitem conhecer a cidade de diferentes formas. Desde visitas a produtoras de flores até passeios culturais.

## Roteiro das Flores

Este roteiro leva você a visitar produtoras de flores, estufas e viveiros. É uma oportunidade única de conhecer como as flores são cultivadas e cuidadas.

## Roteiro Cultural

Visite museus, galerias de arte e espaços culturais que contam a história de Holambra e da comunidade holandesa que fundou a cidade.

## Roteiro Gastronômico

Explore os melhores restaurantes e estabelecimentos gastronômicos de Holambra, degustando pratos típicos e ingredientes locais.

## Roteiro de Natureza

Caminhe por trilhas, visite parques e espaços verdes que oferecem contato direto com a natureza e a beleza da região.

## Planejando Seu Roteiro

Com Oranje, você pode facilmente planejar seu roteiro, encontrar restaurantes, hotéis e atividades que se encaixem no seu perfil.`,
    seoTitle: "Roteiros Turísticos em Holambra: Guia Completo",
    seoDescription: "Descubra os melhores roteiros em Holambra. Flores, cultura, gastronomia e natureza.",
    seoKeywords: "roteiros, turismo, Holambra, experiências",
    category: "roteiros",
    coverImageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  },
  {
    title: "Onde Ficar em Holambra: Hospedagem",
    slug: "onde-ficar-holambra-hospedagem",
    excerpt: "Guia completo de hospedagem em Holambra com opções para todos os orçamentos.",
    content: `# Onde Ficar em Holambra: Hospedagem

Holambra oferece diversas opções de hospedagem que atendem a diferentes perfis de viajantes e orçamentos. Desde hotéis de luxo até pousadas aconchegantes.

## Hotéis em Holambra

Os hotéis da cidade oferecem conforto, qualidade e serviços diferenciados. Muitos possuem restaurantes, spas e áreas de lazer.

## Pousadas e Chalés

Para quem busca uma experiência mais aconchegante e personalizada, as pousadas e chalés de Holambra oferecem ambiente familiar e atendimento dedicado.

## Hospedagem Temática

Algumas hospedagens em Holambra oferecem experiências temáticas, como fazendas de flores ou casarões históricos.

## Dicas para Escolher Hospedagem

- Considere a localização em relação às atrações
- Verifique as comodidades oferecidas
- Leia avaliações de outros hóspedes
- Reserve com antecedência, especialmente durante a Expoflora

## Booking com Oranje

Com Oranje, você encontra as melhores opções de hospedagem em Holambra com informações completas e avaliações de usuários.`,
    seoTitle: "Hospedagem em Holambra: Hotéis e Pousadas",
    seoDescription: "Encontre as melhores opções de hospedagem em Holambra. Hotéis, pousadas e chalés.",
    seoKeywords: "hospedagem, hotéis, pousadas, Holambra",
    category: "hospedagem",
    coverImageUrl: "https://images.unsplash.com/photo-1631049307038-da0ec9d70304?w=800&q=80",
  },
  {
    title: "Transporte em Holambra: Como Se Locomover",
    slug: "transporte-holambra-locomocao",
    excerpt: "Guia de transporte em Holambra. Dicas para se locomover pela cidade.",
    content: `# Transporte em Holambra: Como Se Locomover

Holambra é uma cidade de tamanho médio e oferece várias opções de transporte para que você se locomova com facilidade.

## Transporte Público

A cidade possui sistema de transporte público com ônibus que conectam os principais pontos turísticos e bairros.

## Táxi e Motoristas

Táxis estão disponíveis em pontos estratégicos da cidade. Com Oranje, você também pode solicitar motoristas parceiros verificados e confiáveis.

## Aluguel de Carro

Alugar um carro é uma opção interessante se você deseja explorar a região com liberdade. Diversas locadoras estão disponíveis em Holambra.

## Bicicleta

Holambra é uma cidade amigável para ciclistas. Muitas áreas possuem ciclovias e a topografia é relativamente plana.

## Dicas de Transporte

- Planeje suas rotas com antecedência
- Use aplicativos de transporte para maior segurança
- Respeite as regras de trânsito
- Considere os horários de funcionamento dos transportes`,
    seoTitle: "Transporte em Holambra: Guia de Locomoção",
    seoDescription: "Como se locomover em Holambra. Transporte público, táxi, aluguel de carro e bicicleta.",
    seoKeywords: "transporte, locomoção, Holambra, táxi",
    category: "transporte",
    coverImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  },
  {
    title: "Pontos Turísticos Imprescindíveis em Holambra",
    slug: "pontos-turisticos-holambra",
    excerpt: "Conheça os principais pontos turísticos que você não pode perder em Holambra.",
    content: `# Pontos Turísticos Imprescindíveis em Holambra

Holambra possui diversos pontos turísticos que refletem sua história, cultura e beleza natural.

## Moinho Povos Unidos

O icônico moinho de Holambra é um símbolo da cidade e oferece uma vista panorâmica espetacular. É um local perfeito para fotografias e contemplação.

## Centro Cultural

O Centro Cultural de Holambra apresenta exposições de arte, história e cultura. Um espaço dedicado a preservar a memória e tradição da comunidade.

## Produtoras de Flores

Visite as produtoras de flores para conhecer como as flores são cultivadas. Muitas oferecem tours guiados e venda direta de flores.

## Parques e Áreas Verdes

Holambra possui diversos parques e áreas verdes que oferecem espaço para lazer, caminhadas e contato com a natureza.

## Museus

Museus locais contam a história de Holambra, desde sua fundação até os dias atuais.

## Igrejas e Monumentos

Diversos monumentos religiosos e históricos estão espalhados pela cidade, cada um com sua própria história e significado.`,
    seoTitle: "Pontos Turísticos em Holambra: O Que Não Perder",
    seoDescription: "Guia dos principais pontos turísticos de Holambra. Moinho, museus, parques e mais.",
    seoKeywords: "pontos turísticos, atrações, Holambra, moinho",
    category: "atrações",
    coverImageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  },
  {
    title: "Melhor Época para Visitar Holambra",
    slug: "melhor-epoca-visitar-holambra",
    excerpt: "Descubra a melhor época do ano para visitar Holambra e aproveitar ao máximo.",
    content: `# Melhor Época para Visitar Holambra

A escolha da melhor época para visitar Holambra depende do que você deseja vivenciar. Cada estação oferece experiências únicas.

## Primavera (Setembro a Novembro)

A primavera é uma excelente época para visitar Holambra. O clima é agradável e a cidade está repleta de flores. A Expoflora geralmente acontece nesta estação.

## Verão (Dezembro a Fevereiro)

O verão em Holambra é quente e úmido. É uma boa época para atividades ao ar livre, mas pode ser mais lotada.

## Outono (Março a Maio)

O outono oferece clima ameno e paisagens bonitas. É uma boa época para visitar com menos multidões.

## Inverno (Junho a Agosto)

O inverno em Holambra é ameno. É uma boa época para atividades culturais e gastronômicas.

## Dicas de Planejamento

- Evite períodos de pico se preferir menos multidões
- Verifique o calendário de eventos
- Considere o clima ao escolher atividades
- Reserve hospedagem com antecedência`,
    seoTitle: "Melhor Época para Visitar Holambra: Guia Completo",
    seoDescription: "Descubra a melhor época para visitar Holambra. Clima, eventos e dicas.",
    seoKeywords: "melhor época, quando visitar, Holambra, clima",
    category: "planejamento",
    coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    title: "Dicas Práticas para Visitar Holambra",
    slug: "dicas-praticas-visitar-holambra",
    excerpt: "Dicas essenciais para tornar sua visita a Holambra mais confortável e agradável.",
    content: `# Dicas Práticas para Visitar Holambra

Aqui estão algumas dicas práticas para tornar sua visita a Holambra mais confortável e agradável.

## Documentação

- Leve seu RG ou CPF
- Se for estrangeiro, leve seu passaporte
- Tenha seu comprovante de vacinação em mãos

## Dinheiro e Pagamentos

- Holambra aceita cartão de crédito em a maioria dos estabelecimentos
- Leve dinheiro em espécie para pequenas compras
- Caixas eletrônicos estão disponíveis na cidade

## Comunicação

- Telefone celular com chip brasileiro
- Wi-Fi está disponível em muitos estabelecimentos
- Considere um plano de dados

## Saúde e Segurança

- Leve medicamentos pessoais
- Use protetor solar
- Beba bastante água
- Holambra é uma cidade segura, mas mantenha cuidados básicos

## Bagagem

- Leve roupas confortáveis
- Sapatos apropriados para caminhadas
- Capa de chuva durante a estação chuvosa

## Respeito à Comunidade

- Respeite as tradições locais
- Seja educado com os moradores
- Preserve o meio ambiente`,
    seoTitle: "Dicas Práticas para Visitar Holambra",
    seoDescription: "Dicas essenciais para sua visita a Holambra. Documentação, dinheiro, saúde e segurança.",
    seoKeywords: "dicas, viagem, Holambra, planejamento",
    category: "planejamento",
    coverImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  },
];

async function seedArticles() {
  try {
    const connection = await pool.getConnection();

    for (const article of articles) {
      const query = `
        INSERT INTO articles (
          title, slug, excerpt, content, coverImageUrl,
          seoTitle, seoDescription, seoKeywords,
          category, published, publishedAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date();
      await connection.execute(query, [
        article.title,
        article.slug,
        article.excerpt,
        article.content,
        article.coverImageUrl,
        article.seoTitle,
        article.seoDescription,
        article.seoKeywords,
        article.category,
        true,
        now,
        now,
        now,
      ]);

      console.log(`✓ Artigo criado: ${article.title}`);
    }

    connection.release();
    console.log(`\n✓ ${articles.length} artigos publicados com sucesso!`);
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar artigos:", error);
    process.exit(1);
  }
}

seedArticles();
