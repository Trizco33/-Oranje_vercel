import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection('mysql://root:rccLSfGsRaKkpPhOmXeYcxkajbQItFcD@ballast.proxy.rlwy.net:44746/railway');
  const [rows] = await conn.query<any[]>(`
    SELECT 
      id, name, address, 
      ROUND(lat, 6) as lat, ROUND(lng, 6) as lng,
      dataPending
    FROM places 
    WHERE isPublished = 1
    ORDER BY dataPending, name
  `);
  await conn.end();

  console.log('\n=== LUGARES PUBLICADOS — ENDEREÇO + COORDENADAS ===\n');
  let problems: any[] = [];
  for (const r of rows) {
    const hasLat = r.lat && r.lat !== 0;
    const hasLng = r.lng && r.lng !== 0;
    const hasAddr = r.address && r.address.trim().length > 10;
    const fullAddr = r.address && r.address.includes(',');
    const addrStatus = !hasAddr ? '❌VAZIO' : !fullAddr ? '⚠️SEM_NUMERO' : '✅';
    const latStatus = !hasLat ? '❌' : '✅';
    const lngStatus = !hasLng ? '❌' : '✅';
    const allOk = hasLat && hasLng && hasAddr && fullAddr;
    if (!allOk) problems.push({ ...r, addrStatus, latStatus, lngStatus });
    const icon = allOk ? '✅' : '⚠️';
    console.log(`${icon} [${r.id}] ${r.name}`);
    console.log(`   Endereço: "${r.address || '(vazio)'" + addrStatus}`);
    console.log(`   lat=${r.lat}  lng=${r.lng}  ${latStatus}${lngStatus}`);
  }
  console.log(`\n📊 Total: ${rows.length} | Problemas: ${problems.length} | OK: ${rows.length - problems.length}`);
  if (problems.length) {
    console.log('\n🚨 Com problema:');
    problems.forEach(r => console.log(`  [${r.id}] ${r.name}\n    endereço="${r.address}" → ${r.addrStatus} | coords: ${r.latStatus}${r.lngStatus}`));
  }
}
main();
