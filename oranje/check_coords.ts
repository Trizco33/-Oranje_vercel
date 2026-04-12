import mysql from 'mysql2/promise';
async function main() {
  const conn = await mysql.createConnection('mysql://root:rccLSfGsRaKkpPhOmXeYcxkajbQItFcD@ballast.proxy.rlwy.net:44746/railway');
  
  // 1. Coordenadas duplicadas ou imprecisas (arredondadas a 4 casas)
  const [dup] = await conn.execute(`
    SELECT ROUND(lat,4) as rlat, ROUND(lng,4) as rlng, COUNT(*) as total,
           GROUP_CONCAT(name ORDER BY name SEPARATOR ' | ') as lugares
    FROM places WHERE dataPending=0 AND status='active' AND lat IS NOT NULL
    GROUP BY ROUND(lat,4), ROUND(lng,4)
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `) as any[];
  
  console.log('\n═══ COORDENADAS DUPLICADAS (mesmo ponto até 4 casas) ═══');
  if ((dup as any[]).length === 0) {
    console.log('  Nenhuma duplicata encontrada a 4 casas decimais');
  } else {
    (dup as any[]).forEach((r: any) => {
      console.log(`\n  ⚠️  lat=${r.rlat}, lng=${r.rlng} — ${r.total} lugares:`);
      r.lugares.split(' | ').forEach((n: string) => console.log(`    • ${n}`));
    });
  }

  // 2. Coordenadas com baixa precisão (3 casas ou menos — imprecisão > 100m)
  const [imprecise] = await conn.execute(`
    SELECT id, name, lat, lng, address
    FROM places WHERE dataPending=0 AND status='active' AND lat IS NOT NULL
    ORDER BY ABS(ROUND(lat,3) - lat) ASC
  `) as any[];
  
  // Detectar coords que parecem "genéricas" (sem casas significativas após 4 decimais)
  const generic: any[] = [];
  (imprecise as any[]).forEach((p: any) => {
    const latStr = String(Math.abs(p.lat));
    const lngStr = String(Math.abs(p.lng));
    const latDecimals = (latStr.split('.')[1] || '').replace(/0+$/, '').length;
    const lngDecimals = (lngStr.split('.')[1] || '').replace(/0+$/, '').length;
    if (latDecimals <= 4 || lngDecimals <= 4) generic.push({...p, latDecimals, lngDecimals});
  });
  
  console.log('\n═══ COORDENADAS GENÉRICAS/IMPRECISAS (≤4 casas significativas) ═══');
  if (generic.length === 0) {
    console.log('  Todas as coordenadas têm precisão adequada');
  } else {
    generic.forEach((p: any) => {
      console.log(`  [id=${p.id}] ${p.name}`);
      console.log(`    lat=${p.lat} (${p.latDecimals} dec) | lng=${p.lng} (${p.lngDecimals} dec)`);
      console.log(`    endereço: ${p.address}`);
    });
  }

  // 3. Todos os publicados com coords — verificar spread
  const [all] = await conn.execute(
    `SELECT id, name, lat, lng, address FROM places WHERE dataPending=0 AND status='active' AND lat IS NOT NULL ORDER BY lat`
  ) as any[];
  
  console.log('\n═══ TODOS OS PUBLICADOS — LAT/LNG PARA VERIFICAÇÃO VISUAL ═══');
  console.log('  id   lat           lng          nome');
  (all as any[]).forEach((p: any) => {
    const latS = p.lat.toFixed(6).padEnd(13);
    const lngS = p.lng.toFixed(6).padEnd(13);
    console.log(`  ${String(p.id).padStart(5)}  ${latS}  ${lngS}  ${p.name}`);
  });

  await conn.end();
}
main().catch(console.error);
