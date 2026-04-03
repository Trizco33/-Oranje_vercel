/**
 * Real image URLs for places in Holambra
 * Sources: TripAdvisor, Google Maps, official websites, Booking.com, Wikipedia
 * Used as fallback when place.coverImage / place.images are empty
 */

export const PLACE_IMAGES: Record<string, string[]> = {
  // ─── RESTAURANTES ──────────────────────────────────────────────
  "Café Moinho": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/800px-Moinho_holambra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Holambra_windmill.jpg/600px-Holambra_windmill.jpg",
  ],
  "Cafe Moinho": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/800px-Moinho_holambra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Holambra_windmill.jpg/600px-Holambra_windmill.jpg",
  ],
  "Martin Holandesa": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1",
    "https://martinholandesa.com.br/content/foto4.jpeg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/3a/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1",
  ],
  "Casa Bela Restaurante": [
    "https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/41/a7/73/casa-bela-restaurante.jpg?w=800&h=500&s=1",
    "https://media-cdn.tripadvisor.com/media/photo-s/04/b8/a0/de/casa-bela-restaurante.jpg",
  ],
  "Casa Bela": [
    "https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/41/a7/73/casa-bela-restaurante.jpg?w=800&h=500&s=1",
  ],
  "The Old Dutch": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/8c/eb/b2/tipicamente-holandes.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/4a/fe/95/caption.jpg?w=1100&h=1100&s=1",
  ],
  "Fratelli Wine Bar": [
    "https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/b5/e9/b9/stinco-de-cordeiro-com.jpg?w=900&h=500&s=1",
    "https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-vinho.webp",
  ],
  "Lago do Holandês": [
    "https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKPUIxaywY_656CccCugMGLowWe04FtqESLSx_G4bvYArgJJiWcPmQXIfpqIJJ5RLzfXUEBVe-yI3iTqEJ5htMsM3YyCYzpTwYrr05vacs2diXeLwlrXCAh8_KgJalXSY_80qY-1T5pYdg/w1200-h630-p-k-no-nu/Lago+do+Holandes.jpg",
  ],
  "Tratterie Holandesa": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/24/36/3c/6a/festival-de-inverno-2022.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/bd/f9/3e/entrada-do-estacionamento.jpg?w=900&h=-1&s=1",
    "https://s3-media0.fl.yelpcdn.com/bphoto/GEp30LJsdcRGmF1lQVos5w/348s.jpg",
  ],
  "Zoet en Zout": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/10/0f/97/getlstd-property-photo.jpg?w=500&h=-1&s=1",
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgrjwR3evnVgvyotvg374Sw0UQqfbr8dZ5wUZTM5nTySWiU1Rrno367yLb-3YzeyzHwzaqi6z5zhlX4ejnkiq7qm154OrlVn6n-j_tGV6aM9uDQpFRsIkwzp37IhXwdbJTXG5V68LBzCuk/w1200-h630-p-k-no-nu/OUT_3941.jpg",
    "https://s3-media0.fl.yelpcdn.com/bphoto/gdVn8uBJyOAwHPQeCXw0Lg/348s.jpg",
  ],
  "Hana Restaurante": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/aa/72/b9/sabor-delicadeza-e-amor.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/21/af/70/13/hana-restaurante-holambra.jpg?w=1200&h=1200&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/07/c4/58/hana-restaurante-holambra.jpg?w=1100&h=1100&s=1",
  ],
  "Holambier": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/be/f6/a2/entardecer-de-holambra.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/82/ce/62/caption.jpg?w=1100&h=1100&s=1",
    "https://media-cdn.tripadvisor.com/media/photo-s/27/be/f7/d7/exterior-da-cervejaria.jpg",
  ],

  // ─── PIZZARIAS ─────────────────────────────────────────────────
  "Serrana Pizzaria": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a1/caption.jpg?w=1100&h=1100&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/3f/4c/c6/serrana-pizzaria.jpg?w=1100&h=1100&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a2/caption.jpg?w=1200&h=1200&s=1",
  ],
  "Dr Pizza": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/9c/28/4f/dr-pizza.jpg?w=1200&h=1200&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/9c/28/7c/dr-pizza.jpg?w=1200&h=1200&s=1",
  ],

  // ─── BARES ─────────────────────────────────────────────────────
  "Cervejaria Seo Carneiro": [
    "https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/cd/7f/4f/entrada-da-nossa-humilde.jpg?w=500&h=-1&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/aa/d2/cd/caption.jpg?w=1200&h=1200&s=1",
  ],
  "Deck 237": [
    "https://static2.menufyy.com/deck-237-restaurante-bar-ltda-me-albums-4.jpg",
    "https://static2.menufyy.com/deck-237-restaurante-bar-ltda-me-albums-1.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/1a/ca/07/ta-img-20181020-124213.jpg?w=800&h=500&s=1",
  ],
  "Quintal Yah Yah": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/8f/a5/1f/entrada.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/9d/65/d5/nosso-quintal.jpg?w=900&h=500&s=1",
    "https://media-cdn.tripadvisor.com/media/photo-s/1c/97/cf/59/caipirinha-do-quintal.jpg",
  ],

  // ─── CAFÉS ─────────────────────────────────────────────────────
  "Kendi Cafeteria": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/ff/b2/0c/kendi-cafeteria-e-confeitaria.jpg?w=1200&h=1200&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/bc/fa/4b/kendi-confeitaria.jpg?w=1200&h=1200&s=1",
    "https://media-cdn.tripadvisor.com/media/photo-s/0a/4f/c1/19/kendi-bomboniere-cafeteria.jpg",
  ],
  "Lotus Café": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/b0/2b/8e/e-o-cafe-ta-sempre-fresquinho.jpg?w=500&h=-1&s=1",
    "https://media-cdn.tripadvisor.com/media/photo-s/1e/b9/05/0d/cafe-de-qualidade-num.jpg",
  ],

  // ─── HOTÉIS ────────────────────────────────────────────────────
  "Holambra Garden Hotel": [
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/369911865.jpg?k=93ff4114b604d1145d6347d6ddec8e9e8ee1e7f48e13ff097e5ebbd7f5c99ccf&o=",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/c6/fd/05/holambra-garden-hotel.jpg?w=900&h=-1&s=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/270706316.jpg?k=9df76ab387a7b93b18ab0f482cd4f4e83fa5d7745fdfb74da2f7e0af1e36efd7&o=",
  ],
  "Hotel Villa de Holanda": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/1d/fd/d2/hotel-villa-de-holanda.jpg?w=900&h=500&s=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/601935053.jpg?k=2f2dda875a77f487f86905789d2cd6b6b3c46071983ab0be6624bda983b42e3c&o=",
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/601939646.jpg?k=0eed8b3c778e09088faf3a2073a6e9f688948104a0b58bdf959f360990fdfc2c&o=",
  ],
  "Villa de Holanda Parque Hotel": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/25/d2/83/villa-de-holanda-parque.jpg?w=900&h=500&s=1",
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/601935053.jpg?k=2f2dda875a77f487f86905789d2cd6b6b3c46071983ab0be6624bda983b42e3c&o=",
  ],
  "Shellter Hotel": [
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/297728157.jpg?k=4036a666c0889c64c0542e63fc86bbeaae67ec45bbc1544ec48171089fac2921&o=",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5d/c7/eb/shellter-hotel.jpg?w=900&h=500&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/dc/2b/ab/caption.jpg?w=1200&h=1200&s=1",
  ],
  "Hotel 1948": [
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/369911865.jpg?k=93ff4114b604d1145d6347d6ddec8e9e8ee1e7f48e13ff097e5ebbd7f5c99ccf&o=",
  ],
  "Pousada Rancho da Cachaça": [
    "https://ranchodacachaca.com.br/wp-content/uploads/2022/02/pousada-rancho-da-cachaca.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/9e/3e/68/rancho-da-cachaca-pousada.jpg?w=700&h=400&s=1",
    "https://i.ytimg.com/vi/-EJTZKp0TvE/maxresdefault.jpg",
  ],
  "Parque Hotel Holambra": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/2b/1a/f2/parque-hotel-holambra.jpg?w=900&h=500&s=1",
    "https://images.trvl-media.com/lodging/39000000/38940000/38938300/38938234/c6c8a5a2.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
    "https://i.ytimg.com/vi/HWzeH0sTchs/maxresdefault.jpg",
  ],

  // ─── PARQUES ───────────────────────────────────────────────────
  "Parque Van Gogh": [
    "https://i.ytimg.com/vi/aJfA8tz0XH8/maxresdefault.jpg",
    "https://i.pinimg.com/736x/90/1f/d6/901fd633cb68d004ff73f153df8a4113.jpg",
  ],
  "Bloemen Park": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/54/25/2e/rosas-de-jardim.jpg?w=900&h=500&s=1",
    "https://i.pinimg.com/736x/e1/ca/a8/e1caa8ec2f85fb482a66493b821547ed.jpg",
  ],
  "Parque Cidade das Crianças": [
    "https://saopauloparacriancas.com.br/wp-content/uploads/2022/07/3-1.jpg",
    "https://i.ytimg.com/vi/dcoMl6gxrqs/maxresdefault.jpg",
    "https://i.pinimg.com/736x/8c/3e/2d/8c3e2df5267a80f49d27aee720be420e.jpg",
  ],
  "Lago Vitória Régia": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/0f/ef/2e/foto-panoramica-em-um.jpg?w=900&h=500&s=1",
    "https://i.ytimg.com/vi/WT1MXrm8iaU/maxresdefault.jpg",
    "https://media-cdn.tripadvisor.com/media/photo-s/0d/ed/f5/ce/lago-vitoria-regia-em.jpg",
  ],
  "Nossa Prainha": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/44/67/dc/20160514-142534-largejpg.jpg?w=900&h=-1&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/e3/c0/0f/vista-do-lago-3.jpg?w=900&h=-1&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/f5/8e/0a/local-pra-passar-uma.jpg?w=1000&h=1000&s=1",
  ],

  // ─── PONTOS TURÍSTICOS ─────────────────────────────────────────
  "Moinho Povos Unidos": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/500px-Moinho_holambra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Holambra_windmill.jpg/250px-Holambra_windmill.jpg",
    "https://live.staticflickr.com/4536/23941408687_854da64a0f_z.jpg",
  ],
  "Boulevard Holandês": [
    "https://i.redd.it/pb4dac8vkdra1.jpg",
    "https://cdn.prod.rexby.com/image/8fce094a49e047669b1178e0c38422a8",
    "https://d2enhrgkrmsl80.cloudfront.net/poi-images/650864de1532c128b8e87d09/ATJ83zhU9rL-DEKEjWfh.jpeg?",
  ],
  "Rua dos Guarda-chuvas": [
    "https://i.pinimg.com/736x/57/ab/06/57ab066b45a89b7000193f24d4e623d7.jpg",
    "https://i.pinimg.com/736x/d5/5a/7b/d55a7bac59827b9d2a54deee19008e5c.jpg",
    "https://i.ytimg.com/vi/Z4OjvZzVDPE/maxresdefault.jpg",
  ],
  "Deck do Amor": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/08/ff/50/img-20180211-174802-283.jpg?w=1200&h=-1&s=1",
    "https://i.pinimg.com/736x/d6/82/ed/d682ed13d28f40677c20118680a4dc1b.jpg",
    "https://i.pinimg.com/736x/17/a1/56/17a156fbe4fc7edebdd2105cfc3f2926.jpg",
  ],
  "Museu de Holambra": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/95/87/entrada.jpg?w=1200&h=-1&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/6c/87/de/dsc-0098-largejpg.jpg?w=900&h=-1&s=1",
    "https://c8.alamy.com/comp/2C777C7/the-entrance-of-holambra-historical-museum-museu-holambra-tourist-attraction-located-at-alameda-mauricio-de-nasau-street-in-downtown-2C777C7.jpg",
  ],
  "Portal da Cidade": [
    "https://upload.wikimedia.org/wikipedia/commons/d/da/Portal_Holambra.jpg",
    "https://live.staticflickr.com/4351/36374638894_04cc663dc4_b.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/Entrada_da_cidade_de_Holambra_das_flores.jpg",
  ],
  "Torre do Relógio": [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/9d/f5/torre-do-relogio.jpg?w=1200&h=1200&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/7c/c5/04/torre-do-relogio.jpg?w=800&h=800&s=1",
    "https://media-cdn.tripadvisor.com/media/photo-m/1280/1c/6c/67/5d/torre-do-relogio.jpg",
  ],
};

/**
 * Category fallback images - used when a place has no images and no match in PLACE_IMAGES
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  restaurantes: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  pizzarias: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  bares: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
  cafes: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
  cafés: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
  docerias: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
  hoteis: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
  hotéis: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
  hospedagem: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
  parques: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
  "pontos turísticos": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  turismo: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  compras: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
  default: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
};

/**
 * Get images for a place by name matching (fuzzy)
 */
export function getPlaceImagesByName(name: string): string[] {
  // Exact match
  if (PLACE_IMAGES[name]) return PLACE_IMAGES[name];

  // Partial match (place name contains or is contained in key)
  const nameLower = name.toLowerCase();
  for (const [key, images] of Object.entries(PLACE_IMAGES)) {
    if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      return images;
    }
  }

  return [];
}

/**
 * Get fallback image for a category
 */
export function getCategoryFallbackImage(categoryName?: string | null): string {
  if (!categoryName) return CATEGORY_FALLBACK_IMAGES.default;
  const key = categoryName.toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[key] || CATEGORY_FALLBACK_IMAGES.default;
}
