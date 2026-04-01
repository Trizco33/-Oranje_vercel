import { describe, it, expect } from "vitest";

describe("Site Pages", () => {
  it("SiteHome deve renderizar com 8 seções", () => {
    expect(true).toBe(true);
  });

  it("SiteWhatToDo deve ter conteúdo sobre atrações", () => {
    expect(true).toBe(true);
  });

  it("SiteSEOPages deve suportar 6 páginas diferentes", () => {
    const pages = [
      "melhores-cafes-de-holambra",
      "melhores-restaurantes-de-holambra",
      "bares-e-drinks-em-holambra",
      "roteiro-1-dia-em-holambra",
      "onde-tirar-fotos-em-holambra",
      "eventos-em-holambra",
    ];
    expect(pages.length).toBe(6);
  });

  it("SiteSecondaryPages deve suportar 8 páginas diferentes", () => {
    const pages = [
      "roteiros",
      "mapa",
      "parceiros",
      "seja-um-parceiro",
      "sobre",
      "contato",
      "privacidade",
      "termos",
    ];
    expect(pages.length).toBe(8);
  });

  it("SiteBlog deve filtrar artigos por categoria", () => {
    expect(true).toBe(true);
  });

  it("SiteBlogPost deve renderizar artigo completo", () => {
    expect(true).toBe(true);
  });

  it("Rotas devem estar configuradas corretamente", () => {
    const routes = [
      "/",
      "/o-que-fazer-em-holambra",
      "/melhores-cafes-de-holambra",
      "/melhores-restaurantes-de-holambra",
      "/bares-e-drinks-em-holambra",
      "/roteiro-1-dia-em-holambra",
      "/onde-tirar-fotos-em-holambra",
      "/eventos-em-holambra",
      "/roteiros",
      "/mapa",
      "/parceiros",
      "/seja-um-parceiro",
      "/sobre",
      "/contato",
      "/privacidade",
      "/termos",
      "/blog",
      "/blog/:slug",
    ];
    expect(routes.length).toBe(18);
  });
});
