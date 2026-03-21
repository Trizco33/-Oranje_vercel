-- ═══════════════════════════════════════════════════════════════════════════
-- SEED: Populate places with real image URLs from Holambra
-- Run this after the migration: drizzle/migrations/add_images_field.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- RESTAURANTES
UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1',
  images = '["https://i.ytimg.com/vi/7B2RW7GS258/maxresdefault.jpg
WHERE name LIKE '%Martin Holandesa%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg',
  images = '["https://s3-media0.fl.yelpcdn.com/bphoto/7b3sGluJl9ppMeiGuzq_mg/348s.jpg
WHERE name LIKE '%Casa Bela%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1',
  images = '["https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib2-s6ugtUYLuSAtjEDJFAn2qAVjJ5zyiyrXON1XsJ_IZXvnydIJE_ay8x3IDV-m1bwqUQf0RwR7edFKLQmystrflwfYdYBZh9bJOiZBisYzGVFJVbz3LNlowS00KfOPHWB_Re7GkDetTv/s1600/1300-77_dutch+gables.jpg
WHERE name LIKE '%Old Dutch%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp',
  images = '["https://s3-media0.fl.yelpcdn.com/bphoto/fbMGnveFeT-eoLxB8J_g8A/258s.jpg
WHERE name LIKE '%Fratelli%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg',
  images = '["https://i.ytimg.com/vi/djyEhV-X8IE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLABWYjrrQ9cVsI_fadE-UBrR-IYEw
WHERE name LIKE '%Lago do Holand%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/24/36/3c/6a/festival-de-inverno-2022.jpg?w=900&h=500&s=1',
  images = '["https://i.ytimg.com/vi/OMryNlEm48E/sddefault.jpg
WHERE name LIKE '%Tratterie%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/10/0f/97/getlstd-property-photo.jpg?w=500&h=-1&s=1',
  images = '["https://understandinghospitality.com/wp-content/uploads/2024/05/treditainterior14-808x1024.jpg
WHERE name LIKE '%Zoet en Zout%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/aa/72/b9/sabor-delicadeza-e-amor.jpg?w=900&h=500&s=1',
  images = '["https://i.ytimg.com/vi/i_GitffIVKs/sddefault.jpg
WHERE name LIKE '%Hana%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/be/f6/a2/entardecer-de-holambra.jpg?w=900&h=500&s=1',
  images = '["https://upload.wikimedia.org/wikipedia/commons/1/18/Montagem_Holambra.jpg
WHERE name LIKE '%Holambier%' AND status = 'active';

-- PIZZARIAS
UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/d8/7f/a1/caption.jpg?w=1100&h=1100&s=1',
  images = '["https://s3-media0.fl.yelpcdn.com/bphoto/wPk9rux0-qv5n7dKVQdySw/348s.jpg
WHERE name LIKE '%Serrana%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/9c/28/4f/dr-pizza.jpg?w=1200&h=1200&s=1',
  images = '["https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHD6n2AS268vuftA8-m8oFnbGTR-5wGp1LE6rd-NSqzXFCvQafwRFNWUpz9riLvcSQ-LLaLg9fN1rZMln_WNUYKNdw1I2KtYG9sH3BTLe8SFHuEdY3wCqoyJgCOYURpamYu0ryeatMNU-QHnqOH7K39nx8jrRwKoT0o20rNguhbKyZ-CB306lIIj3v_c0j/s1652/Screenshot%202025-12-03%20at%202.02.26%E2%80%AFPM.png
WHERE name LIKE '%Dr Pizza%' OR name LIKE '%Dr. Pizza%' AND status = 'active';

-- BARES
UPDATE places SET 
  coverImage = 'https://seocarneiro.com.br/wp-content/uploads/2023/11/20231102_110640-scaled.jpg',
  images = '["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/cd/7f/4f/entrada-da-nossa-humilde.jpg?w=900&h=500&s=1
WHERE name LIKE '%Seo Carneiro%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://static2.menufyy.com/deck-237-restaurante-bar-ltda-me-albums-4.jpg',
  images = '["https://s3-media0.fl.yelpcdn.com/bphoto/GAC2MKjlOaGSLotXUQN0fg/348s.jpg
WHERE name LIKE '%Deck 237%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/8f/a5/1f/entrada.jpg?w=900&h=500&s=1',
  images = '["https://bloximages.chicago2.vip.townnews.com/fltimes.com/content/tncms/assets/v3/editorial/f/af/faf234fd-ce80-59a9-b326-f2b0d85e5e78/62e16a9edf9ae.image.jpg?crop=1330%2C698%2C0%2C94&resize=1200%2C630&order=crop%2Cresize
WHERE name LIKE '%Quintal Yah%' AND status = 'active';

-- CAFÉS
UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/ff/b2/0c/kendi-cafeteria-e-confeitaria.jpg?w=1200&h=1200&s=1',
  images = '["https://placehold.co/1200x600/e2e8f0/1e293b?text=Exterior_or_interior_photo_of_Kendi_Cafeteria_and_
WHERE name LIKE '%Kendi%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/b0/2b/8e/e-o-cafe-ta-sempre-fresquinho.jpg?w=500&h=-1&s=1',
  images = '["https://images.pexels.com/photos/34206672/pexels-photo-34206672/free-photo-of-cozy-sunset-cafe-interior-with-warm-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
WHERE name LIKE '%Lotus%' AND status = 'active';

-- HOTÉIS
UPDATE places SET 
  coverImage = 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/369911865.jpg?k=93ff4114b604d1145d6347d6ddec8e9e8ee1e7f48e13ff097e5ebbd7f5c99ccf&o=',
  images = '["https://cf.bstatic.com/xdata/images/hotel/max1024x768/369911865.jpg?k=93ff4114b604d1145d6347d6ddec8e9e8ee1e7f48e13ff097e5ebbd7f5c99ccf&o=","https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/c6/fd/05/holambra-garden-hotel.jpg?w=900&h=-1&s=1","https://cf.bstatic.com/xdata/images/hotel/max1024x768/270706316.jpg?k=9df76ab387a7b93b18ab0f482cd4f4e83fa5d7745fdfb74da2f7e0af1e36efd7&o="]'
WHERE name LIKE '%Garden Hotel%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/1d/fd/d2/hotel-villa-de-holanda.jpg?w=900&h=500&s=1',
  images = '["https://villa-de-holanda-parque.allsaopaulohotels.com/data/Images/OriginalPhoto/17430/1743077/1743077013/image-holambra-villa-de-holanda-parque-hotel-11.JPEG
WHERE name LIKE '%Villa de Holanda%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/297728157.jpg?k=4036a666c0889c64c0542e63fc86bbeaae67ec45bbc1544ec48171089fac2921&o=',
  images = '["https://cf.bstatic.com/xdata/images/hotel/max1024x768/297728157.jpg?k=4036a666c0889c64c0542e63fc86bbeaae67ec45bbc1544ec48171089fac2921&o=","https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5d/c7/eb/shellter-hotel.jpg?w=900&h=500&s=1"]'
WHERE name LIKE '%Shellter%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://ranchodacachaca.com.br/wp-content/uploads/2022/02/pousada-rancho-da-cachaca.jpg',
  images = '["https://cf.bstatic.com/xdata/images/hotel/max1024x768/238029167.jpg?k=f520f9a78209a6719dccd0a6e5f7c8d6c5937d9463ae2d5e16c1e52ce6a453ca&o=
WHERE name LIKE '%Rancho da Cacha%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/2b/1a/f2/parque-hotel-holambra.jpg?w=900&h=500&s=1',
  images = '["https://i.ytimg.com/vi/x906VVX225E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCLMh8r2pb4uiBhALWynqUXfFBamA
WHERE name LIKE '%Parque Hotel%' AND status = 'active';

-- PARQUES
UPDATE places SET 
  coverImage = 'https://i.ytimg.com/vi/aJfA8tz0XH8/maxresdefault.jpg',
  images = '["https://i.ytimg.com/vi/JB52rZeRgR0/maxresdefault.jpg
WHERE name LIKE '%Van Gogh%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/54/25/2e/rosas-de-jardim.jpg?w=900&h=500&s=1',
  images = '["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Aramaki_rose_park04s2400.jpg/960px-Aramaki_rose_park04s2400.jpg
WHERE name LIKE '%Bloemen%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://saopauloparacriancas.com.br/wp-content/uploads/2022/07/3-1.jpg',
  images = '["https://upload.wikimedia.org/wikipedia/commons/7/7d/Submarino_da_Cidade_da_Crian%C3%A7a.jpg
WHERE name LIKE '%Cidade das Crian%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/0f/ef/2e/foto-panoramica-em-um.jpg?w=900&h=500&s=1',
  images = '["https://live.staticflickr.com/2913/14506288868_096f57fde1_h.jpg
WHERE name LIKE '%Vit%ria R%gia%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/44/67/dc/20160514-142534-largejpg.jpg?w=900&h=-1&s=1',
  images = '["https://lh5.googleusercontent.com/p/AF1QipNgJGZGcsmNW_O2I-PnZeRvuzjh7v-w2YzOb9zD=s1600
WHERE name LIKE '%Nossa Prainha%' AND status = 'active';

-- PONTOS TURÍSTICOS
UPDATE places SET 
  coverImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Moinho_holambra.jpg/500px-Moinho_holambra.jpg',
  images = '["https://upload.wikimedia.org/wikipedia/commons/c/c5/Holambra_windmill.jpg
WHERE name LIKE '%Moinho%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://i.redd.it/pb4dac8vkdra1.jpg',
  images = '["https://i.redd.it/pb4dac8vkdra1.jpg","https://cdn.prod.rexby.com/image/8fce094a49e047669b1178e0c38422a8","https://d2enhrgkrmsl80.cloudfront.net/poi-images/650864de1532c128b8e87d09/ATJ83zhU9rL-DEKEjWfh.jpeg?"]'
WHERE name LIKE '%Boulevard%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://i.pinimg.com/736x/57/ab/06/57ab066b45a89b7000193f24d4e623d7.jpg',
  images = '["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Cagliari_collage.png/250px-Cagliari_collage.png
WHERE name LIKE '%Guarda-chuva%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/08/ff/50/img-20180211-174802-283.jpg?w=1200&h=-1&s=1',
  images = '["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/e1/c6/e9/closed-off-pr-telco-labor.jpg?w=900&h=500&s=1
WHERE name LIKE '%Deck do Amor%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/95/87/entrada.jpg?w=1200&h=-1&s=1',
  images = '["https://springfieldmuseums.org/wp-content/uploads/2023/05/Front-Entryway-Michele-and-Donald-DAmour-Museum-of-Fine-Arts-2023-scaled.jpg
WHERE name LIKE '%Museu%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://upload.wikimedia.org/wikipedia/commons/d/da/Portal_Holambra.jpg',
  images = '["https://c8.alamy.com/comp/2HEEHJF/dutch-style-portal-at-the-entrance-of-holambra-town-this-is-a-tipycal-town-built-my-dutch-immigrants-so-paulo-estate-brazil-2HEEHJF.jpg
WHERE name LIKE '%Portal%' AND status = 'active';

UPDATE places SET 
  coverImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/89/9d/f5/torre-do-relogio.jpg?w=1200&h=1200&s=1',
  images = '["https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/NTT_DoCoMo_Yoyogi_Building_2009_cropped.jpg/960px-NTT_DoCoMo_Yoyogi_Building_2009_cropped.jpg
WHERE name LIKE '%Torre do Rel%' AND status = 'active';

-- Verify updated rows
SELECT id, name, coverImage IS NOT NULL AS has_cover, images IS NOT NULL AS has_images
FROM places WHERE status = 'active' ORDER BY id;
